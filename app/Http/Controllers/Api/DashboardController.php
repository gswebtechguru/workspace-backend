<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\AttendanceRecord;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $dateFilter = $request->input('date_filter', 'today');
        
        $dateRange = $this->getDateRange($dateFilter);

        if ($user->isAdmin()) {
            return $this->getAdminMetrics($dateRange);
        } else {
            return $this->getEmployeeMetrics($user, $dateRange);
        }
    }

    public function metrics(Request $request)
    {
        return $this->index($request);
    }

    private function getAdminMetrics(array $dateRange)
    {
        $today = Carbon::today()->toDateString();
        
        // Employee metrics
        $totalEmployees = User::where('is_active', true)->count();
        $presentToday = AttendanceRecord::where('work_date', $today)
            ->whereIn('status', ['present', 'late'])
            ->count();
        $absentToday = AttendanceRecord::where('work_date', $today)
            ->where('status', 'absent')
            ->count();
        $onLeaveToday = LeaveRequest::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->where('status', 'approved')
            ->count();

        // Project metrics
        $activeProjects = Project::where('status', 'active')->count();
        $completedProjects = Project::where('status', 'completed')->count();
        $delayedProjects = Project::where('status', 'active')
            ->where('target_delivery_date', '<', now())
            ->count();

        // Task metrics
        $completedTasks = Task::completed()
            ->whereBetween('completed_at', $dateRange)
            ->count();
        $overdueTasks = Task::overdue()->count();
        $blockedTasks = Task::where('status', 'on_hold')->count();

        // Leave metrics
        $pendingLeaveRequests = LeaveRequest::pending()->count();

        return response()->json([
            'total_employees' => $totalEmployees,
            'present_today' => $presentToday,
            'absent_today' => $absentToday,
            'on_leave_today' => $onLeaveToday,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'delayed_projects' => $delayedProjects,
            'completed_tasks' => $completedTasks,
            'overdue_tasks' => $overdueTasks,
            'blocked_tasks' => $blockedTasks,
            'pending_leave_requests' => $pendingLeaveRequests,
        ]);
    }

    private function getEmployeeMetrics(User $user, array $dateRange)
    {
        $today = Carbon::today()->toDateString();
        
        // Attendance
        $todayAttendance = AttendanceRecord::where('user_id', $user->id)
            ->where('work_date', $today)
            ->first();

        // Tasks
        $myTasks = $user->assignedTasks();
        $todayTasks = (clone $myTasks)->where('scheduled_date', $today)->count();
        $completedToday = (clone $myTasks)
            ->completed()
            ->whereDate('completed_at', $today)
            ->count();
        $overdueTasks = (clone $myTasks)->overdue()->count();

        // Projects
        $myProjects = $user->projects()->where('status', 'active')->count();

        // Time tracking
        $totalEstimated = (clone $myTasks)->sum('estimated_minutes');
        $totalActual = (clone $myTasks)->sum('actual_minutes');

        return response()->json([
            'attendance' => $todayAttendance ? [
                'check_in_at' => $todayAttendance->check_in_at,
                'check_out_at' => $todayAttendance->check_out_at,
                'status' => $todayAttendance->status,
                'total_hours' => $todayAttendance->total_hours,
            ] : null,
            'today_tasks' => $todayTasks,
            'completed_today' => $completedToday,
            'overdue_tasks' => $overdueTasks,
            'my_projects' => $myProjects,
            'total_estimated_hours' => round($totalEstimated / 60, 1),
            'total_actual_hours' => round($totalActual / 60, 1),
        ]);
    }

    private function getDateRange(string $filter): array
    {
        $today = Carbon::today();

        return match($filter) {
            'today' => [$today->startOfDay(), $today->endOfDay()],
            'this_week' => [$today->startOfWeek(), $today->endOfWeek()],
            'this_month' => [$today->startOfMonth(), $today->endOfMonth()],
            'last_month' => [
                $today->subMonth()->startOfMonth(),
                $today->subMonth()->endOfMonth()
            ],
            default => [$today->startOfDay(), $today->endOfDay()],
        };
    }
}
