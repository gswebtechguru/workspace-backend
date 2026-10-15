<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    protected $fillable = ['name', 'work_days', 'start_time', 'end_time', 'timezone'];

    protected $casts = [
        'work_days' => 'array',
    ];
}
