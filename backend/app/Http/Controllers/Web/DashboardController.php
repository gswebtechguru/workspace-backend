<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\AttendanceRecord;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function admin()
    {
        $today = Carbon::today()->toDateString();

        $metrics = [
            'present_today' => AttendanceRecord::where('work_date', $today)
                ->whereIn('status', ['present', 'late'])->count(),
            'absent_today' => AttendanceRecord::where('work_date', $today)
                ->where('status', 'absent')->count(),
            'active_projects' => Project::where('status', 'active')->count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'overdue_tasks' => Task::where('status', '!=', 'completed')
                ->where('status', '!=', 'cancelled')
                ->where('due_date', '<', now())->count(),
            'pending_leave' => LeaveRequest::where('status', 'pending')->count(),
        ];

        $activeProjects = Project::with(['members', 'tasks'])
            ->where('status', 'active')
            ->take(5)
            ->get()
            ->each(function ($project) {
                $project->progress = $project->calculateProgress();
            });

        $pendingLeaves = LeaveRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        return view('dashboard', compact('metrics', 'activeProjects', 'pendingLeaves'));
    }

    public function employee()
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        $todayAttendance = AttendanceRecord::where('user_id', $user->id)
            ->where('work_date', $today)
            ->first();

        $todayTasks = $user->assignedTasks()
            ->where('scheduled_date', $today)
            ->with('project')
            ->get();

        $overdueTasks = $user->assignedTasks()
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->where('due_date', '<', now())
            ->with('project')
            ->get();

        $myProjects = $user->projects()
            ->where('status', 'active')
            ->get()
            ->each(function ($project) {
                $project->progress = $project->calculateProgress();
            });

        $totalEstimatedHours = $todayTasks->sum('estimated_minutes') / 60;
        $totalActualHours = $todayTasks->sum('actual_minutes') / 60;

        return view('employee.dashboard', compact(
            'todayAttendance',
            'todayTasks',
            'overdueTasks',
            'myProjects',
            'totalEstimatedHours',
            'totalActualHours'
        ));
    }
}
