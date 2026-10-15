@extends('layouts.app')

@section('title', 'Create Project')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <a href="{{ route('projects.index') }}" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Create New Project</h1>
            <p class="text-sm text-gray-500 dark:text-slate-400">Fill in the details to create a new project</p>
        </div>
    </div>

    <form method="POST" action="{{ route('projects.store') }}" class="card p-6 space-y-6">
        @csrf

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Project Title *</label>
            <input type="text" name="title" value="{{ old('title') }}" required
                   class="input-field @error('title') border-red-500 @enderror"
                   placeholder="Enter project title">
            @error('title')
                <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
            <textarea name="description" rows="3" class="input-field" placeholder="Project description">{{ old('description') }}</textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Start Date *</label>
                <input type="date" name="start_date" value="{{ old('start_date', date('Y-m-d')) }}" required
                       class="input-field @error('start_date') border-red-500 @enderror">
                @error('start_date')
                    <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Delivery Date (Optional)</label>
                <input type="date" name="target_delivery_date" value="{{ old('target_delivery_date') }}" class="input-field">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
            <select name="priority" class="input-field">
                <option value="low" {{ old('priority') == 'low' ? 'selected' : '' }}>Low</option>
                <option value="medium" {{ old('priority', 'medium') == 'medium' ? 'selected' : '' }}>Medium</option>
                <option value="high" {{ old('priority') == 'high' ? 'selected' : '' }}>High</option>
                <option value="critical" {{ old('priority') == 'critical' ? 'selected' : '' }}>Critical</option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Technology Stack</label>
            <input type="text" name="technology_stack" value="{{ old('technology_stack') }}"
                   class="input-field" placeholder="React, Laravel, MySQL (comma separated)">
        </div>

        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-xs text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> You will be automatically assigned as the Project Manager.
            </p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Assign Team Members</label>
            <div class="border border-gray-200 dark:border-slate-600 rounded-lg max-h-64 overflow-y-auto p-2 space-y-1">
                @foreach($employees as $emp)
                    @if($emp->user_id !== auth()->id())
                        <label class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                            <input type="checkbox" name="member_ids[]" value="{{ $emp->user_id }}"
                                   {{ in_array($emp->user_id, old('member_ids', [])) ? 'checked' : '' }}
                                   class="rounded text-emerald-600">
                            <div class="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                {{ substr($emp->first_name, 0, 1) }}{{ substr($emp->last_name, 0, 1) }}
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium">{{ $emp->first_name }} {{ $emp->last_name }}</p>
                                <p class="text-xs text-gray-500 dark:text-slate-400">{{ $emp->designation }}</p>
                            </div>
                        </label>
                    @endif
                @endforeach
            </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button type="submit" class="btn-primary flex-1">Create Project</button>
            <a href="{{ route('projects.index') }}" class="btn-secondary flex-1 text-center">Cancel</a>
        </div>
    </form>
</div>
@endsection
