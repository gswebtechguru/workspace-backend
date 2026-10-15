<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Project::with(['members', 'tasks']);

        if (!$user->isAdmin()) {
            $query->whereHas('members', fn($q) => $q->where('user_id', $user->id));
        }

        $projects = $query->latest()->get()->each(fn($p) => $p->progress = $p->calculateProgress());

        return view('projects.index', compact('projects'));
    }

    public function myProjects()
    {
        $projects = Auth::user()->projects()
            ->with(['members', 'tasks'])
            ->get()
            ->each(fn($p) => $p->progress = $p->calculateProgress());

        return view('projects.index', compact('projects'));
    }

    public function create()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $employees = \App\Models\EmployeeProfile::where('status', 'active')->with('user')->get();
        return view('projects.create', compact('employees'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'target_delivery_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,critical',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $projectCount = Project::count() + 1;
        $projectId = 'PRJ' . str_pad($projectCount, 3, '0', STR_PAD_LEFT);

        $project = Project::create([
            'project_id' => $projectId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'],
            'target_delivery_date' => $validated['target_delivery_date'] ?? null,
            'priority' => $validated['priority'],
            'project_manager_id' => Auth::id(),
            'status' => 'planning',
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'role' => 'manager',
            'joined_at' => now()->toDateString(),
        ]);

        if (!empty($validated['member_ids'])) {
            foreach ($validated['member_ids'] as $userId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $userId,
                    'role' => 'developer',
                    'joined_at' => now()->toDateString(),
                ]);

                Notification::create([
                    'user_id' => $userId,
                    'type' => 'project_update',
                    'title' => 'New Project Assignment',
                    'message' => "You have been assigned to \"{$project->title}\"",
                    'entity_id' => $project->id,
                    'entity_type' => 'project',
                ]);
            }
        }

        return redirect()->route('projects.show', $project)->with('success', 'Project created successfully');
    }

    public function show(Project $project)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && !$project->members()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $project->load(['projectManager', 'members.user', 'milestones', 'tasks.assignees']);
        $project->progress = $project->calculateProgress();

        $availableEmployees = \App\Models\EmployeeProfile::where('status', 'active')
            ->with('user')
            ->whereDoesntHave('user', function($q) use ($project) {
                $q->whereHas('projectMemberships', fn($q2) => $q2->where('project_id', $project->id));
            })
            ->get();

        return view('projects.show', compact('project', 'availableEmployees'));
    }

    public function update(Request $request, Project $project)
    {
        if (!Auth::user()->isAdmin()) abort(403);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:planning,active,on_hold,completed,cancelled,archived',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'target_delivery_date' => 'nullable|date',
        ]);

        $project->update($validated);
        return back()->with('success', 'Project updated');
    }

    public function destroy(Project $project)
    {
        if (!Auth::user()->isAdmin()) abort(403);
        $project->delete();
        return redirect()->route('projects.index')->with('success', 'Project deleted');
    }

    public function addMember(Request $request, Project $project)
    {
        if (!Auth::user()->isAdmin()) abort(403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $validated['user_id'],
            'role' => 'developer',
            'joined_at' => now()->toDateString(),
        ]);

        return back()->with('success', 'Member added');
    }

    public function removeMember(Project $project, ProjectMember $member)
    {
        if (!Auth::user()->isAdmin()) abort(403);
        if ($member->role === 'manager') {
            return back()->with('error', 'Cannot remove project manager');
        }
        $member->delete();
        return back()->with('success', 'Member removed');
    }
}
