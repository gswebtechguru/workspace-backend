<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskChecklistItem extends Model
{
    protected $fillable = ['task_id', 'title', 'is_completed', 'order'];

    protected $casts = [
        'is_completed' => 'boolean',
        'order' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
