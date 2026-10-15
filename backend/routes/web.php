<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ProjectController;
use App\Http\Controllers\Web\TaskController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\LeaveController;
use App\Http\Controllers\Web\ChatController;
use App\Http\Controllers\Web\EmployeeController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\AnnouncementController;
use App\Http\Controllers\Web\SettingsController;

// Guest routes
Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated routes
Route::middleware(['auth'])->group(function () {

    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');

    // Employee Dashboard
    Route::get('/my-dashboard', [DashboardController::class, 'employee'])->name('employee.dashboard');

    // Projects
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('/projects/{project}/members/{member}', [ProjectController::class, 'removeMember'])->name('projects.members.remove');

    // Employee Projects
    Route::get('/my-projects', [ProjectController::class, 'myProjects'])->name('employee.projects');

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::patch('/tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');

    // Employee Tasks
    Route::get('/my-tasks', [TaskController::class, 'myTasks'])->name('employee.tasks');

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/checkout', [AttendanceController::class, 'checkout'])->name('attendance.checkout');

    // Employee Attendance
    Route::get('/my-attendance', [AttendanceController::class, 'myAttendance'])->name('employee.attendance');

    // Leave Management
    Route::get('/leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::post('/leave', [LeaveController::class, 'store'])->name('leave.store');
    Route::patch('/leave/{leaveRequest}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
    Route::patch('/leave/{leaveRequest}/reject', [LeaveController::class, 'reject'])->name('leave.reject');

    // Employee Leave
    Route::get('/my-leave', [LeaveController::class, 'myLeave'])->name('employee.leave');

    // Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{project}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{project}', [ChatController::class, 'store'])->name('chat.store');
    Route::delete('/chat/message/{message}', [ChatController::class, 'destroy'])->name('chat.destroy');

    // Employees (Admin)
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('employees.toggle-status');

    // Profile
    Route::get('/profile', [EmployeeController::class, 'profile'])->name('profile');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/my-reports', [ReportController::class, 'myReports'])->name('employee.reports');

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // Notifications
    Route::patch('/notifications/{notification}/read', [\App\Http\Controllers\Web\NotificationController::class, 'markAsRead'])->name('notifications.read');
});
