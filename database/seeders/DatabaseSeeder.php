<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\Department;
use App\Models\Team;
use App\Models\WorkSchedule;
use App\Models\LeaveType;
use App\Models\CompanySetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Full system access']);
        $employeeRole = Role::create(['name' => 'employee', 'description' => 'Employee access']);

        // Create permissions
        $permissions = [
            ['name' => 'employees.view', 'group' => 'employees'],
            ['name' => 'employees.create', 'group' => 'employees'],
            ['name' => 'employees.update', 'group' => 'employees'],
            ['name' => 'projects.view', 'group' => 'projects'],
            ['name' => 'projects.create', 'group' => 'projects'],
            ['name' => 'projects.assign_members', 'group' => 'projects'],
            ['name' => 'tasks.view', 'group' => 'tasks'],
            ['name' => 'tasks.create', 'group' => 'tasks'],
            ['name' => 'tasks.assign', 'group' => 'tasks'],
            ['name' => 'tasks.complete', 'group' => 'tasks'],
            ['name' => 'tasks.reopen', 'group' => 'tasks'],
            ['name' => 'time_entries.create', 'group' => 'tasks'],
            ['name' => 'reports.view_own', 'group' => 'reports'],
            ['name' => 'reports.view_team', 'group' => 'reports'],
            ['name' => 'reports.view_company', 'group' => 'reports'],
            ['name' => 'reports.export', 'group' => 'reports'],
            ['name' => 'attendance.view', 'group' => 'attendance'],
            ['name' => 'attendance.correct', 'group' => 'attendance'],
            ['name' => 'leave.view', 'group' => 'leave'],
            ['name' => 'leave.create', 'group' => 'leave'],
            ['name' => 'leave.approve', 'group' => 'leave'],
            ['name' => 'chat.send', 'group' => 'chat'],
            ['name' => 'notifications.view', 'group' => 'notifications'],
            ['name' => 'settings.manage', 'group' => 'settings'],
            ['name' => 'announcements.manage', 'group' => 'announcements'],
        ];

        foreach ($permissions as $perm) {
            Permission::create($perm);
        }

        // Assign all permissions to admin
        $adminRole->permissions()->attach(Permission::all()->pluck('id'));

        // Assign basic permissions to employee
        $employeePermissions = Permission::whereIn('name', [
            'tasks.view', 'tasks.create', 'tasks.complete',
            'time_entries.create', 'reports.view_own',
            'chat.send', 'notifications.view',
            'attendance.view', 'leave.create', 'projects.view',
        ])->pluck('id');
        $employeeRole->permissions()->attach($employeePermissions);

        // Create work schedule
        $schedule = WorkSchedule::create([
            'name' => 'Standard',
            'work_days' => [1, 2, 3, 4, 5], // Mon-Fri
            'start_time' => '09:00',
            'end_time' => '18:00',
            'timezone' => 'Asia/Kolkata',
        ]);

        // Create departments
        $engineering = Department::create(['name' => 'Engineering', 'description' => 'Software development']);
        $design = Department::create(['name' => 'Design', 'description' => 'UI/UX design']);
        $qa = Department::create(['name' => 'QA', 'description' => 'Quality assurance']);

        // Create teams
        $frontendTeam = Team::create(['name' => 'Frontend Team', 'department_id' => $engineering->id]);
        $backendTeam = Team::create(['name' => 'Backend Team', 'department_id' => $engineering->id]);
        $mobileTeam = Team::create(['name' => 'Mobile Team', 'department_id' => $engineering->id]);

        // Create leave types
        LeaveType::create(['name' => 'Casual Leave', 'max_days_per_year' => 12, 'is_paid' => true]);
        LeaveType::create(['name' => 'Sick Leave', 'max_days_per_year' => 12, 'is_paid' => true]);
        LeaveType::create(['name' => 'Earned Leave', 'max_days_per_year' => 15, 'is_paid' => true]);
        LeaveType::create(['name' => 'Unpaid Leave', 'is_paid' => false]);

        // Create admin user
        $adminUser = User::create([
            'username' => 'suresh.nair',
            'name' => 'Suresh Nair',
            'email' => 'suresh@company.com',
            'password' => Hash::make('Suresh@123'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        EmployeeProfile::create([
            'user_id' => $adminUser->id,
            'employee_id' => 'EMP001',
            'first_name' => 'Suresh',
            'last_name' => 'Nair',
            'email' => 'suresh@company.com',
            'phone' => '+91-9876543210',
            'gender' => 'male',
            'date_of_birth' => '1980-09-12',
            'joining_date' => '2020-08-20',
            'designation' => 'Engineering Manager',
            'department_id' => $engineering->id,
            'work_schedule_id' => $schedule->id,
            'status' => 'active',
        ]);

        // Create project manager
        $pmUser = User::create([
            'username' => 'rajesh.kumar',
            'name' => 'Rajesh Kumar',
            'email' => 'rajesh@company.com',
            'password' => Hash::make('Rajesh@123'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        EmployeeProfile::create([
            'user_id' => $pmUser->id,
            'employee_id' => 'EMP002',
            'first_name' => 'Rajesh',
            'last_name' => 'Kumar',
            'email' => 'rajesh@company.com',
            'phone' => '+91-9876543211',
            'gender' => 'male',
            'date_of_birth' => '1990-05-15',
            'joining_date' => '2022-01-15',
            'designation' => 'Senior Frontend Developer',
            'department_id' => $engineering->id,
            'team_id' => $frontendTeam->id,
            'reporting_manager_id' => $adminUser->id,
            'work_schedule_id' => $schedule->id,
            'status' => 'active',
            'skills' => ['React', 'TypeScript', 'Node.js'],
        ]);

        // Create employees
        $employees = [
            ['username' => 'priya.sharma', 'first_name' => 'Priya', 'last_name' => 'Sharma', 'emp_id' => 'EMP003', 'designation' => 'UI/UX Designer', 'dept' => $design->id, 'team' => $frontendTeam->id],
            ['username' => 'amit.patel', 'first_name' => 'Amit', 'last_name' => 'Patel', 'emp_id' => 'EMP004', 'designation' => 'Backend Developer', 'dept' => $engineering->id, 'team' => $backendTeam->id],
            ['username' => 'sneha.reddy', 'first_name' => 'Sneha', 'last_name' => 'Reddy', 'emp_id' => 'EMP005', 'designation' => 'QA Engineer', 'dept' => $qa->id, 'team' => $backendTeam->id],
            ['username' => 'ananya.gupta', 'first_name' => 'Ananya', 'last_name' => 'Gupta', 'emp_id' => 'EMP006', 'designation' => 'Mobile Developer', 'dept' => $engineering->id, 'team' => $mobileTeam->id],
        ];

        foreach ($employees as $emp) {
            $user = User::create([
                'username' => $emp['username'],
                'name' => $emp['first_name'] . ' ' . $emp['last_name'],
                'email' => $emp['username'] . '@company.com',
                'password' => Hash::make('Password@123'),
                'role_id' => $employeeRole->id,
                'is_active' => true,
            ]);

            EmployeeProfile::create([
                'user_id' => $user->id,
                'employee_id' => $emp['emp_id'],
                'first_name' => $emp['first_name'],
                'last_name' => $emp['last_name'],
                'email' => $emp['username'] . '@company.com',
                'gender' => 'female',
                'joining_date' => '2023-01-15',
                'designation' => $emp['designation'],
                'department_id' => $emp['dept'],
                'team_id' => $emp['team'],
                'reporting_manager_id' => $pmUser->id,
                'work_schedule_id' => $schedule->id,
                'status' => 'active',
            ]);
        }

        // Create company settings
        $settings = [
            ['key' => 'company_name', 'value' => 'TechCorp Solutions', 'type' => 'string'],
            ['key' => 'timezone', 'value' => 'Asia/Kolkata', 'type' => 'string'],
            ['key' => 'reporting_cutoff_time', 'value' => '18:30', 'type' => 'string'],
            ['key' => 'working_days', 'value' => json_encode([1, 2, 3, 4, 5]), 'type' => 'json'],
            ['key' => 'max_time_entry_minutes', 'value' => '720', 'type' => 'integer'],
            ['key' => 'min_time_entry_minutes', 'value' => '5', 'type' => 'integer'],
        ];

        foreach ($settings as $setting) {
            CompanySetting::create($setting);
        }
    }
}
