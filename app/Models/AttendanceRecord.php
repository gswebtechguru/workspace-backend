<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'user_id', 'work_date', 'check_in_at', 'check_out_at', 'status',
        'source', 'is_late', 'is_missing_checkout', 'notes',
    ];

    protected $casts = [
        'work_date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'is_late' => 'boolean',
        'is_missing_checkout' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function corrections()
    {
        return $this->hasMany(AttendanceCorrection::class);
    }

    public function getTotalHoursAttribute()
    {
        if (!$this->check_in_at || !$this->check_out_at) {
            return 0;
        }
        return round($this->check_in_at->diffInMinutes($this->check_out_at) / 60, 1);
    }
}

class AttendanceCorrection extends Model
{
    protected $fillable = ['attendance_record_id', 'corrected_by', 'reason', 'old_values', 'new_values'];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function attendanceRecord()
    {
        return $this->belongsTo(AttendanceRecord::class);
    }

    public function correctedBy()
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }
}
