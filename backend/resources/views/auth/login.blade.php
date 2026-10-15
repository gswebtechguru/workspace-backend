@extends('layouts.app')

@section('title', 'Login')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
                <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>
            <h1 class="text-4xl font-bold text-white mb-2">WorkForce Pro</h1>
            <p class="text-emerald-100">Employee & Project Management System</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Sign in to your account</h2>

            <form method="POST" action="{{ route('login') }}" class="space-y-4">
                @csrf

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Username</label>
                    <input type="text" name="username" value="{{ old('username') }}" required
                           class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                           placeholder="Enter your username">
                    @error('username')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                    <input type="password" name="password" required
                           class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                           placeholder="Enter your password">
                    @error('password')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    Sign In
                </button>
            </form>

            <div class="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <p class="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-3">Demo Accounts (any password):</p>
                <div class="space-y-2">
                    <div class="px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-900 dark:text-slate-100">Admin — Suresh Nair</p>
                            <span class="badge bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">Admin</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Username: suresh.nair</p>
                    </div>
                    <div class="px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-900 dark:text-slate-100">Employee — Priya Sharma</p>
                            <span class="badge bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">Employee</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Username: priya.sharma</p>
                    </div>
                </div>
            </div>
        </div>

        <p class="text-center text-emerald-100 text-sm mt-6">
            © 2024 TechCorp Solutions. All rights reserved.
        </p>
    </div>
</div>
@endsection
