<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['user.employeeProfile', 'leaveType', 'approver']);

        if (!Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'duration' => 'required|in:full_day,first_half,second_half,morning_short,evening_short',
            'reason' => 'required|string',
        ]);

        $leave = LeaveRequest::create([
            'user_id' => Auth::id(),
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'duration' => $validated['duration'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        // Notify admins
        $admins = User::where('is_active', true)
            ->whereHas('role', fn($q) => $q->where('name', 'admin'))
            ->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'leave_approved',
                'title' => 'New Leave Request',
                'message' => Auth::user()->name . ' applied for leave',
                'entity_id' => $leave->id,
                'entity_type' => 'leave',
            ]);
        }

        return response()->json($leave, 201);
    }

    public function approve(LeaveRequest $leaveRequest)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $leaveRequest->update([
            'status' => 'approved',
            'approver_id' => Auth::id(),
            'decision_at' => now(),
        ]);

        Notification::create([
            'user_id' => $leaveRequest->user_id,
            'type' => 'leave_approved',
            'title' => 'Leave Approved',
            'message' => 'Your leave request has been approved',
            'entity_id' => $leaveRequest->id,
            'entity_type' => 'leave',
        ]);

        return response()->json($leaveRequest);
    }

    public function reject(LeaveRequest $leaveRequest)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $leaveRequest->update([
            'status' => 'rejected',
            'approver_id' => Auth::id(),
            'decision_at' => now(),
            'decision_notes' => request('notes'),
        ]);

        Notification::create([
            'user_id' => $leaveRequest->user_id,
            'type' => 'leave_rejected',
            'title' => 'Leave Rejected',
            'message' => 'Your leave request has been rejected',
            'entity_id' => $leaveRequest->id,
            'entity_type' => 'leave',
        ]);

        return response()->json($leaveRequest);
    }

    public function types()
    {
        return response()->json(LeaveType::all());
    }
}
