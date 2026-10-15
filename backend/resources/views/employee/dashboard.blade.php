@extends('layouts.app')

@section('title', 'My Dashboard')

@section('content')
<div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Good {{ now()->hour < 12 ? 'Morning' : (now()->hour < 17 ? 'Afternoon' : 'Evening') }}, {{ auth()->user()->name }}!
            </h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ now()->format('l, F j, Y') }}</p>
        </div>
        <a href="{{ route('employee.projects') }}" class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Task
        </a>
    </div>

    <!-- Attendance Status -->
    <div class="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center {{ $todayAttendance ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-slate-700' }}">
                <svg class="w-6 h-6 {{ $todayAttendance ? 'text-green-600 dark:text-green-400' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                    @if($todayAttendance && $todayAttendance->check_in_at)
                        Checked in at {{ $todayAttendance->check_in_at->format('h:i A') }}
                    @else
                        Not checked in yet
                    @endif
                </p>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                    @if($todayAttendance && $todayAttendance->check_out_at)
                        Checked out at {{ $todayAttendance->check_out_at->format('h:i A') }}
                        <span class="ml-2 font-medium text-green-600 dark:text-green-400">
                            • Total: {{ number_format($todayAttendance->check_in_at->diffInHours($todayAttendance->check_out_at), 1) }} hours
                        </span>
                    @elseif($todayAttendance && $todayAttendance->check_in_at)
                        Working • Remember to check out
                    @else
                        Login-based attendance • Auto check-in on first login
                    @endif
                </p>
            </div>
        </div>
        @if($todayAttendance && $todayAttendance->check_in_at && !$todayAttendance->check_out_at)
            <form method="POST" action="{{ route('attendance.checkout') }}">
                @csrf
                <button type="submit" class="btn-primary flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Check Out
                </button>
            </form>
        @endif
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ $todayTasks->count() }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">Today's Tasks</p>
                </div>
            </div>
        </div>
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ $todayTasks->where('status', 'completed')->count() }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">Completed</p>
                </div>
            </div>
        </div>
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ $overdueTasks->count() }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">Overdue</p>
                </div>
            </div>
        </div>
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ number_format($totalActualHours, 1) }}h</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">of {{ number_format($totalEstimatedHours, 1) }}h planned</p>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Today's Tasks -->
        <div class="lg:col-span-2 card p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-slate-100">Today's Tasks</h3>
                <span class="text-xs text-gray-500 dark:text-slate-400">{{ $todayTasks->where('status', 'completed')->count() }}/{{ $todayTasks->count() }} done</span>
            </div>
            <div class="space-y-3">
                @forelse($todayTasks as $task)
                    <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                        <form method="POST" action="{{ route('tasks.complete', $task) }}" class="inline">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors {{ $task->status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-500 hover:border-green-500' }}">
                                @if($task->status === 'completed')
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                @endif
                            </button>
                        </form>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium {{ $task->status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-slate-100' }}">{{ $task->title }}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400">{{ $task->project->title }} • Est: {{ number_format($task->estimated_minutes / 60, 1) }}h</p>
                        </div>
                        <div class="flex items-center gap-2">
                            @if($task->is_overdue && $task->status !== 'completed')
                                <span class="badge bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Overdue</span>
                            @endif
                            <span class="badge {{ $task->status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : ($task->status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300') }}">
                                {{ str_replace('_', ' ', $task->status) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-8">
                        <svg class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p class="text-sm text-gray-500 dark:text-slate-400">No tasks planned for today.</p>
                        <a href="{{ route('employee.projects') }}" class="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium mt-2 inline-block">+ Plan your day</a>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- My Projects -->
        <div class="card p-5">
            <h3 class="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                My Projects
            </h3>
            <div class="space-y-2">
                @forelse($myProjects as $project)
                    <div class="p-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{{ $project->title }}</p>
                            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">{{ $project->progress }}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full" style="width: {{ $project->progress }}%"></div>
                        </div>
                    </div>
                @empty
                    <p class="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No projects assigned</p>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Overdue Tasks Alert -->
    @if($overdueTasks->count() > 0)
        <div class="card p-5 border-l-4 border-l-red-500">
            <h3 class="font-semibold text-red-800 dark:text-red-400 flex items-center gap-2 mb-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Overdue Tasks ({{ $overdueTasks->count() }})
            </h3>
            <div class="space-y-2">
                @foreach($overdueTasks as $task)
                    <div class="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ $task->title }}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400">{{ $task->project->title }} • Due: {{ $task->due_date?->format('M d, Y') ?? $task->scheduled_date->format('M d, Y') }}</p>
                        </div>
                        <form method="POST" action="{{ route('tasks.complete', $task) }}">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="text-xs text-red-600 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300">Mark Done</button>
                        </form>
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
