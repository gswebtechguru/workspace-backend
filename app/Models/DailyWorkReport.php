<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyWorkReport extends Model
{
    protected $fillable = [
        'user_id', 'report_date', 'generated_at', 'is_complete', 'attendance_status',
    ];

    protected $casts = [
        'report_date' => 'date',
        'generated_at' => 'datetime',
        'is_complete' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(DailyWorkReportItem::class);
    }
}

class DailyWorkReportItem extends Model
{
    protected $fillable = [
        'daily_work_report_id', 'task_id', 'task_title', 'project_name',
        'status_at_cutoff', 'current_status', 'completed_at', 'estimated_minutes',
        'actual_minutes', 'is_carried_forward', 'original_scheduled_date',
        'blocker_reason', 'notes',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'is_carried_forward' => 'boolean',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
        'original_scheduled_date' => 'date',
    ];

    public function report()
    {
        return $this->belongsTo(DailyWorkReport::class, 'daily_work_report_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
