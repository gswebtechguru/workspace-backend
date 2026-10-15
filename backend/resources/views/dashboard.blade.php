@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="space-y-6" x-data="{ dateFilter: 'today' }">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Admin Dashboard</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">Overview of company operations and metrics</p>
        </div>
        <div class="flex items-center gap-2">
            <template x-for="filter in ['today', 'this_week', 'this_month', 'last_month']">
                <button @click="dateFilter = filter"
                        :class="dateFilter === filter ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        x-text="filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())">
                </button>
            </template>
        </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['present_today'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Present Today</p>
        </div>

        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['active_projects'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Active Projects</p>
        </div>

        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['completed_tasks'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Completed Tasks</p>
        </div>

        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['overdue_tasks'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Overdue Tasks</p>
        </div>

        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['absent_today'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Absent Today</p>
        </div>

        <div class="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ $metrics['pending_leave'] ?? 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Pending Leave</p>
        </div>
    </div>

    <!-- Active Projects -->
    <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Active Projects</h3>
        <div class="space-y-3">
            @forelse($activeProjects as $project)
                <a href="{{ route('projects.show', $project) }}" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ $project->title }}</p>
                        <p class="text-xs text-gray-500 dark:text-slate-400">{{ $project->members->count() }} members • Due {{ $project->target_delivery_date?->format('M d, Y') ?? 'N/A' }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-20 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-600" style="width: {{ $project->progress }}%"></div>
                        </div>
                        <span class="text-xs font-medium text-gray-700 dark:text-slate-300">{{ $project->progress }}%</span>
                    </div>
                </a>
            @empty
                <p class="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No active projects</p>
            @endforelse
        </div>
    </div>

    <!-- Pending Leave Requests -->
    <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Pending Leave Requests</h3>
        <div class="space-y-3">
            @forelse($pendingLeaves as $leave)
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {{ substr($leave->user->name, 0, 1) }}
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ $leave->user->name }}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400">{{ $leave->start_date->format('M d') }} to {{ $leave->end_date->format('M d') }} • {{ $leave->reason }}</p>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <form method="POST" action="{{ route('leave.approve', $leave) }}" class="inline">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900">Approve</button>
                        </form>
                        <form method="POST" action="{{ route('leave.reject', $leave) }}" class="inline">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900">Reject</button>
                        </form>
                    </div>
                </div>
            @empty
                <p class="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No pending requests</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
