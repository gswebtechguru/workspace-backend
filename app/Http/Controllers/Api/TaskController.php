<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskStatusHistory;
use App\Models\TaskTimeEntry;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Task::with(['project', 'assignees', 'creator']);

        // Employees see only their tasks
        if (!$user->isAdmin()) {
            $query->whereHas('assignees', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filters
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $tasks = $query->orderBy('created_at', 'desc')->paginate(20);

        // Add is_overdue attribute
        $tasks->each(function ($task) {
            $task->is_overdue = $task->is_overdue;
        });

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'assignee_ids' => 'required|array|min:1',
            'assignee_ids.*' => 'exists:users,id',
            'priority' => 'required|in:low,medium,high,critical',
            'due_date' => 'nullable|date',
            'estimated_minutes' => 'nullable|integer|min:1',
        ]);

        // Generate task ID
        $taskCount = Task::count() + 1;
        $taskId = 'TSK' . str_pad($taskCount, 3, '0', STR_PAD_LEFT);

        $task = Task::create([
            'task_id' => $taskId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'project_id' => $validated['project_id'],
            'creator_id' => Auth::id(),
            'scheduled_date' => now()->toDateString(),
            'due_date' => $validated['due_date'] ?? null,
            'estimated_minutes' => $validated['estimated_minutes'] ?? 0,
            'priority' => $validated['priority'],
            'status' => 'planned',
        ]);

        // Assign to users
        $task->assignees()->attach($validated['assignee_ids']);

        // Status history
        TaskStatusHistory::create([
            'task_id' => $task->id,
            'from_status' => null,
            'to_status' => 'planned',
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        ActivityLog::log('created', 'task', $task->id, null, $task->toArray());

        // Notify assignees
        foreach ($validated['assignee_ids'] as $userId) {
            if ($userId !== Auth::id()) {
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'task_assigned',
                    'title' => 'New Task Assigned',
                    'message' => "You have been assigned to \"{$task->title}\"",
                    'entity_id' => $task->id,
                    'entity_type' => 'task',
                ]);
            }
        }

        return response()->json($task->load('assignees', 'project'), 201);
    }

    public function show(Task $task)
    {
        $user = Auth::user();

        // Check access
        if (!$user->isAdmin() && !$task->assignees()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->load(['project', 'assignees', 'creator', 'statusHistory.changedBy', 'timeEntries.user', 'comments.user']);
        $task->is_overdue = $task->is_overdue;

        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'due_date' => 'nullable|date',
            'estimated_minutes' => 'nullable|integer|min:1',
        ]);

        $oldValues = $task->toArray();
        $task->update($validated);

        ActivityLog::log('updated', 'task', $task->id, $oldValues, $task->toArray());

        return response()->json($task);
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:planned,in_progress,completed,on_hold,cancelled',
            'reason' => 'nullable|string',
        ]);

        $oldStatus = $task->status;
        
        $task->update(['status' => $validated['status']]);

        TaskStatusHistory::create([
            'task_id' => $task->id,
            'from_status' => $oldStatus,
            'to_status' => $validated['status'],
            'changed_by' => Auth::id(),
            'reason' => $validated['reason'] ?? null,
            'changed_at' => now(),
        ]);

        ActivityLog::log('status_changed', 'task', $task->id, 
            ['status' => $oldStatus], 
            ['status' => $validated['status']]
        );

        // Notify project members
        $project = $task->project;
        foreach ($project->members as $member) {
            if ($member->user_id !== Auth::id()) {
                Notification::create([
                    'user_id' => $member->user_id,
                    'type' => 'task_completed',
                    'title' => 'Task Status Updated',
                    'message' => "\"{$task->title}\" is now {$validated['status']}",
                    'entity_id' => $task->id,
                    'entity_type' => 'task',
                ]);
            }
        }

        return response()->json($task->load('statusHistory'));
    }

    public function complete(Request $request, Task $task)
    {
        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completion_notes' => $request->input('notes'),
        ]);

        TaskStatusHistory::create([
            'task_id' => $task->id,
            'from_status' => $task->getOriginal('status'),
            'to_status' => 'completed',
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        // Update project progress
        $project = $task->project;
        $project->update(['progress' => $project->calculateProgress()]);

        return response()->json($task);
    }

    public function reopen(Request $request, Task $task)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $task->update([
            'status' => 'in_progress',
            'completed_at' => null,
        ]);

        TaskStatusHistory::create([
            'task_id' => $task->id,
            'from_status' => 'completed',
            'to_status' => 'in_progress',
            'changed_by' => Auth::id(),
            'reason' => $validated['reason'],
            'changed_at' => now(),
        ]);

        return response()->json($task);
    }

    public function addTimeEntry(Request $request, Task $task)
    {
        $validated = $request->validate([
            'duration_minutes' => 'required|integer|min:1|max:720',
            'work_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $entry = TaskTimeEntry::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'duration_minutes' => $validated['duration_minutes'],
            'work_date' => $validated['work_date'],
            'description' => $validated['description'] ?? null,
        ]);

        // Update task actual minutes
        $totalMinutes = $task->timeEntries()->sum('duration_minutes');
        $task->update(['actual_minutes' => $totalMinutes]);

        return response()->json($entry, 201);
    }

    public function history(Task $task)
    {
        return response()->json(
            $task->statusHistory()->with('changedBy')->orderBy('changed_at', 'desc')->get()
        );
    }
}
