<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyWorkReport;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function daily(Request $request)
    {
        $query = DailyWorkReport::with(['user.employeeProfile', 'items']);

        if (!Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        if ($request->has('user_id') && Auth::user()->isAdmin()) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->orderBy('report_date', 'desc')->paginate(20));
    }

    public function project(Project $project)
    {
        $tasks = $project->tasks()->with('assignees')->get();
        
        return response()->json([
            'project' => $project,
            'total_tasks' => $tasks->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'overdue' => $tasks->filter(fn($t) => $t->is_overdue)->count(),
            'total_estimated_hours' => round($tasks->sum('estimated_minutes') / 60, 1),
            'total_actual_hours' => round($tasks->sum('actual_minutes') / 60, 1),
            'progress' => $project->calculateProgress(),
        ]);
    }

    public function workHistory(Request $request)
    {
        $query = Task::with(['project', 'assignees']);

        if (!Auth::user()->isAdmin()) {
            $query->whereHas('assignees', fn($q) => $q->where('user_id', Auth::id()));
        }

        if ($request->has('user_id') && Auth::user()->isAdmin()) {
            $query->whereHas('assignees', fn($q) => $q->where('user_id', $request->user_id));
        }

        return response()->json($query->orderBy('scheduled_date', 'desc')->paginate(30));
    }

    public function export(string $type)
    {
        return response()->json(['message' => 'Export feature coming soon']);
    }
}
