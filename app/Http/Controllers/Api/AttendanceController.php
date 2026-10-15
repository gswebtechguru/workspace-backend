<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AttendanceRecord::with('user.employeeProfile');

        if ($request->has('date')) {
            $query->where('work_date', $request->date);
        }

        if (!Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        return response()->json($query->orderBy('work_date', 'desc')->paginate(20));
    }

    public function today()
    {
        $records = AttendanceRecord::with('user.employeeProfile')
            ->where('work_date', Carbon::today()->toDateString())
            ->get();

        return response()->json($records);
    }

    public function checkOut()
    {
        $record = AttendanceRecord::where('user_id', Auth::id())
            ->where('work_date', Carbon::today()->toDateString())
            ->first();

        if (!$record) {
            return response()->json(['message' => 'No check-in record found'], 404);
        }

        $record->update([
            'check_out_at' => now(),
            'is_missing_checkout' => false,
        ]);

        return response()->json($record);
    }

    public function correct(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'attendance_id' => 'required|exists:attendance_records,id',
            'check_in_at' => 'nullable|date',
            'check_out_at' => 'nullable|date',
            'status' => 'nullable|in:present,absent,late,half_day,on_leave,holiday',
            'reason' => 'required|string',
        ]);

        $record = AttendanceRecord::find($validated['attendance_id']);
        $oldValues = $record->toArray();

        $record->update(array_filter([
            'check_in_at' => $validated['check_in_at'] ?? null,
            'check_out_at' => $validated['check_out_at'] ?? null,
            'status' => $validated['status'] ?? null,
        ]));

        $record->corrections()->create([
            'corrected_by' => Auth::id(),
            'reason' => $validated['reason'],
            'old_values' => $oldValues,
            'new_values' => $record->toArray(),
        ]);

        return response()->json($record);
    }
}
