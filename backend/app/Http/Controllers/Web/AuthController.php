<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check()) {
            return Auth::user()->isAdmin()
                ? redirect()->route('dashboard')
                : redirect()->route('employee.dashboard');
        }
        return view('auth.login');
    }

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
            return back()->withErrors(['username' => 'Invalid credentials']);
        }

        if (!$user->is_active) {
            return back()->withErrors(['username' => 'Your account is inactive']);
        }

        Auth::login($user);
        $user->update(['last_login_at' => now()]);

        // Auto check-in
        $this->autoCheckIn($user);

        return $user->isAdmin()
            ? redirect()->route('dashboard')
            : redirect()->route('employee.dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    private function autoCheckIn(User $user): void
    {
        $today = Carbon::today()->toDateString();

        if (AttendanceRecord::where('user_id', $user->id)->where('work_date', $today)->exists()) {
            return;
        }

        $profile = $user->employeeProfile;
        if (!$profile) return;

        $schedule = $profile->workSchedule;
        $workDays = $schedule ? $schedule->work_days : [1, 2, 3, 4, 5];

        if (!in_array(Carbon::today()->dayOfWeek, $workDays)) {
            return;
        }

        $startTime = $schedule ? $schedule->start_time : '09:00';
        $isLate = Carbon::now()->format('H:i:s') > $startTime;

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
}
