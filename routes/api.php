<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\SettingsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);
    
    // Employees (Admin only for most operations)
    Route::apiResource('employees', EmployeeController::class);
    Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus']);
    Route::post('/employees/{employee}/reset-password', [EmployeeController::class, 'resetPassword']);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::delete('/projects/{project}/members/{member}', [ProjectController::class, 'removeMember']);
    Route::post('/projects/{project}/milestones', [ProjectController::class, 'addMilestone']);
    
    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::patch('/tasks/{task}/complete', [TaskController::class, 'complete']);
    Route::patch('/tasks/{task}/reopen', [TaskController::class, 'reopen']);
    Route::post('/tasks/{task}/time-entries', [TaskController::class, 'addTimeEntry']);
    Route::get('/tasks/{task}/history', [TaskController::class, 'history']);
    
    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::post('/attendance/corrections', [AttendanceController::class, 'correct']);
    
    // Leave
    Route::apiResource('leave-requests', LeaveController::class);
    Route::patch('/leave-requests/{leaveRequest}/approve', [LeaveController::class, 'approve']);
    Route::patch('/leave-requests/{leaveRequest}/reject', [LeaveController::class, 'reject']);
    Route::get('/leave-types', [LeaveController::class, 'types']);
    
    // Chat (Project Messages)
    Route::get('/projects/{project}/messages', [ChatController::class, 'index']);
    Route::post('/projects/{project}/messages', [ChatController::class, 'store']);
    Route::delete('/messages/{message}', [ChatController::class, 'destroy']);
    Route::post('/messages/{message}/attachments', [ChatController::class, 'uploadAttachment']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    
    // Reports
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/project/{project}', [ReportController::class, 'project']);
    Route::get('/reports/work-history', [ReportController::class, 'workHistory']);
    Route::get('/reports/export/{type}', [ReportController::class, 'export']);
    
    // Announcements
    Route::apiResource('announcements', AnnouncementController::class);
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markAsRead']);
    
    // Settings (Admin only)
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::get('/settings/departments', [SettingsController::class, 'departments']);
    Route::get('/settings/leave-types', [SettingsController::class, 'leaveTypes']);
    
    // Activity Logs (Admin only)
    Route::get('/activity-logs', [SettingsController::class, 'activityLogs']);
});
