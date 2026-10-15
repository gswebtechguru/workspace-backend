<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id', 'title', 'description', 'requirements', 'client_reference',
        'technology_stack', 'project_manager_id', 'start_date', 'target_delivery_date',
        'actual_completion_date', 'priority', 'status', 'estimated_hours',
        'actual_hours', 'budget', 'progress',
    ];

    protected $casts = [
        'technology_stack' => 'array',
        'start_date' => 'date',
        'target_delivery_date' => 'date',
        'actual_completion_date' => 'date',
        'budget' => 'decimal:2',
        'progress' => 'integer',
    ];

    public function projectManager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function milestones()
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function messages()
    {
        return $this->hasMany(ProjectMessage::class);
    }

    public function attachments()
    {
        return $this->hasMany(ProjectAttachment::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDelayed($query)
    {
        return $query->where('status', 'active')
            ->where('target_delivery_date', '<', now());
    }

    public function calculateProgress(): int
    {
        $tasks = $this->tasks;
        if ($tasks->count() === 0) return 0;
        
        $completed = $tasks->where('status', 'completed')->count();
        return round(($completed / $tasks->count()) * 100);
    }
}
