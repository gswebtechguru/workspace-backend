<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectMilestone;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Project::with(['projectManager', 'members.user']);

        // Employees see only their projects
        if (!$user->isAdmin()) {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate progress for each project
        $projects->each(function ($project) {
            $project->progress = $project->calculateProgress();
        });

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'target_delivery_date' => 'nullable|date|after_or_equal:start_date',
            'priority' => 'required|in:low,medium,high,critical',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        // Generate project ID
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

        // Add project manager as member
        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'role' => 'manager',
            'joined_at' => now()->toDateString(),
        ]);

        // Add other members
        if (!empty($validated['member_ids'])) {
            foreach ($validated['member_ids'] as $userId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $userId,
                    'role' => 'developer',
                    'joined_at' => now()->toDateString(),
                ]);
            }
        }

        ActivityLog::log('created', 'project', $project->id, null, $project->toArray());

        return response()->json($project->load('members.user'), 201);
    }

    public function show(Project $project)
    {
        $user = Auth::user();

        // Check access
        if (!$user->isAdmin() && !$project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->load([
            'projectManager',
            'members.user',
            'milestones',
            'tasks.assignees',
            'attachments.attachment',
        ]);

        $project->progress = $project->calculateProgress();

        return response()->json($project);
    }

    public function update(Request $request, Project $project)
    {
        $user = Auth::user();

        if (!$user->isAdmin() && $project->project_manager_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:planning,active,on_hold,completed,cancelled,archived',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'target_delivery_date' => 'nullable|date',
        ]);

        $oldValues = $project->toArray();
        $project->update($validated);

        ActivityLog::log('updated', 'project', $project->id, $oldValues, $project->toArray());

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ActivityLog::log('deleted', 'project', $project->id, $project->toArray(), null);
        
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function addMember(Request $request, Project $project)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:manager,developer,designer,tester,viewer',
        ]);

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'],
            'joined_at' => now()->toDateString(),
        ]);

        return response()->json($member->load('user'), 201);
    }

    public function removeMember(Project $project, ProjectMember $member)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($member->role === 'manager') {
            return response()->json(['message' => 'Cannot remove project manager'], 400);
        }

        $member->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }

    public function addMilestone(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
        ]);

        $milestone = ProjectMilestone::create([
            'project_id' => $project->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        return response()->json($milestone, 201);
    }
}
