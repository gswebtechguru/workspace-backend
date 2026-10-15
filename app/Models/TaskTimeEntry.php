<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskTimeEntry extends Model
{
    protected $fillable = ['task_id', 'user_id', 'work_date', 'duration_minutes', 'description', 'correction_reason'];

    protected $casts = [
        'work_date' => 'date',
        'duration_minutes' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
