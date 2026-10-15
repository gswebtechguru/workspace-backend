<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeProfile::with(['user', 'department', 'team']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $employees = $query->orderBy('first_name')->paginate(20);

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:8',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'required|date',
            'designation' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'] ?? $validated['username'] . '@company.com',
            'password' => Hash::make($validated['password']),
            'role_id' => 2, // Employee role
            'is_active' => true,
        ]);

        // Generate employee ID
        $empCount = EmployeeProfile::count() + 1;
        $employeeId = 'EMP' . str_pad($empCount, 3, '0', STR_PAD_LEFT);

        // Create employee profile
        $profile = EmployeeProfile::create([
            'user_id' => $user->id,
            'employee_id' => $employeeId,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'joining_date' => $validated['joining_date'],
            'designation' => $validated['designation'],
            'department_id' => $validated['department_id'] ?? null,
            'status' => 'active',
        ]);

        ActivityLog::log('created', 'employee', $profile->id, null, $profile->toArray());

        return response()->json($profile->load('user', 'department'), 201);
    }

    public function show(EmployeeProfile $employee)
    {
        return response()->json(
            $employee->load('user', 'department', 'team', 'reportingManager', 'workSchedule')
        );
    }

    public function update(Request $request, EmployeeProfile $employee)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'sometimes|date',
            'designation' => 'sometimes|string',
            'department_id' => 'nullable|exists:departments,id',
            'team_id' => 'nullable|exists:teams,id',
            'skills' => 'nullable|array',
        ]);

        $oldValues = $employee->toArray();
        $employee->update($validated);

        // Update user name if name changed
        if (isset($validated['first_name']) || isset($validated['last_name'])) {
            $employee->user->update([
                'name' => $employee->first_name . ' ' . $employee->last_name,
            ]);
        }

        ActivityLog::log('updated', 'employee', $employee->id, $oldValues, $employee->toArray());

        return response()->json($employee);
    }

    public function toggleStatus(EmployeeProfile $employee)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newStatus = $employee->status === 'active' ? 'inactive' : 'active';
        $employee->update(['status' => $newStatus]);
        
        // Also update user active status
        $employee->user->update(['is_active' => $newStatus === 'active']);

        ActivityLog::log('status_changed', 'employee', $employee->id, 
            ['status' => $employee->getOriginal('status')], 
            ['status' => $newStatus]
        );

        return response()->json($employee);
    }

    public function resetPassword(Request $request, EmployeeProfile $employee)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $employee->user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
