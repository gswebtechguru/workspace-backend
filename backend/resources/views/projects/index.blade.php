@extends('layouts.app')

@section('title', 'Projects')

@section('content')
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Projects</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ $projects->count() }} projects</p>
        </div>
        @if(auth()->user()->isAdmin())
            <a href="{{ route('projects.create') }}" class="btn-primary flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                New Project
            </a>
        @endif
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @forelse($projects as $project)
            <a href="{{ route('projects.show', $project) }}" class="card p-5 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <span class="text-xs text-gray-400 dark:text-slate-500 font-mono">{{ $project->project_id }}</span>
                        <h3 class="font-semibold text-gray-900 dark:text-slate-100 mt-0.5">{{ $project->title }}</h3>
                    </div>
                    <div class="flex gap-1.5">
                        <span class="badge {{ $project->status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300' }}">
                            {{ str_replace('_', ' ', $project->status) }}
                        </span>
                        <span class="badge {{ $project->priority === 'critical' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : ($project->priority === 'high' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300') }}">
                            {{ $project->priority }}
                        </span>
                    </div>
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">{{ $project->description }}</p>
                <div class="mb-3">
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{{ $project->progress }}%</span>
                    </div>
                    <div class="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-300 bg-gradient-to-r {{ $project->progress >= 75 ? 'from-emerald-400 to-green-600' : ($project->progress >= 50 ? 'from-teal-400 to-emerald-500' : 'from-amber-400 to-amber-500') }}" style="width: {{ $project->progress }}%"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            {{ $project->members->count() }}
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {{ $project->start_date->format('M d') }}
                        </span>
                    </div>
                    <span>{{ $project->tasks->where('status', 'completed')->count() }}/{{ $project->tasks->count() }} tasks</span>
                </div>
            </a>
        @empty
            <div class="col-span-2 card p-12 text-center">
                <p class="text-gray-500 dark:text-slate-400">No projects found</p>
            </div>
        @endforelse
    </div>
</div>
@endsection
