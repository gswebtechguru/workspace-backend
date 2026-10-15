<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Login and issue token
     * Auto check-in on first login of the day
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive. Please contact admin.'],
            ]);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Auto check-in logic
        $this->autoCheckIn($user);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role', 'employeeProfile'),
            'token' => $token,
            'attendance' => $this->getTodayAttendance($user),
        ]);
    }

    /**
     * Logout and revoke token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get current user
     */
    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load('role', 'employeeProfile', 'employeeProfile.department')
        );
    }

    /**
     * Auto check-in on first login of the day
     */
    private function autoCheckIn(User $user): void
    {
        $today = Carbon::today()->toDateString();
        
        // Check if already checked in today
        $existingRecord = AttendanceRecord::where('user_id', $user->id)
            ->where('work_date', $today)
            ->first();

        if ($existingRecord) {
            return; // Already checked in
        }

        // Get employee profile for work schedule
        $profile = $user->employeeProfile;
        if (!$profile) {
            return;
        }

        // Check if today is a work day
        $schedule = $profile->workSchedule;
        $workDays = $schedule ? $schedule->work_days : [1, 2, 3, 4, 5]; // Default: Mon-Fri
        $dayOfWeek = Carbon::today()->dayOfWeek;

        if (!in_array($dayOfWeek, $workDays)) {
            return; // Not a work day
        }

        // Determine if late
        $startTime = $schedule ? $schedule->start_time : '09:00';
        $currentTime = Carbon::now()->format('H:i:s');
        $isLate = $currentTime > $startTime;

        // Create attendance record
        AttendanceRecord::create([
            'user_id' => $user->id,
            'work_date' => $today,
            'check_in_at' => now(),
            'status' => $isLate ? 'late' : 'present',
            'source' => 'automatic_login',
            'is_late' => $isLate,
            'is_missing_checkout' => true,
        ]);
    }

    /**
     * Get today's attendance for user
     */
    private function getTodayAttendance(User $user): ?array
    {
        $record = AttendanceRecord::where('user_id', $user->id)
            ->where('work_date', Carbon::today()->toDateString())
            ->first();

        if (!$record) {
            return null;
        }

        return [
            'check_in_at' => $record->check_in_at,
            'check_out_at' => $record->check_out_at,
            'status' => $record->status,
            'is_late' => $record->is_late,
            'is_missing_checkout' => $record->is_missing_checkout,
        ];
    }
}
