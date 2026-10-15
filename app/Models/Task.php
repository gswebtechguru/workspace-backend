<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_id', 'title', 'description', 'acceptance_criteria', 'project_id',
        'milestone_id', 'creator_id', 'reviewer_id', 'scheduled_date', 'due_date',
        'estimated_minutes', 'actual_minutes', 'priority', 'status', 'progress_notes',
        'completed_at', 'completion_notes', 'blocker_reason', 'original_scheduled_date',
        'rescheduled_from', 'reschedule_reason',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone()
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignees');
    }

    public function statusHistory()
    {
        return $this->hasMany(TaskStatusHistory::class)->orderBy('changed_at', 'desc');
    }

    public function timeEntries()
    {
        return $this->hasMany(TaskTimeEntry::class);
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function checklistItems()
    {
        return $this->hasMany(TaskChecklistItem::class);
    }

    public function dependencies()
    {
        return $this->hasMany(TaskDependency::class);
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    // Accessors
    public function getIsOverdueAttribute(): bool
    {
        if ($this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }
        return $this->due_date && $this->due_date->isPast();
    }

    // Scopes
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->where('due_date', '<', now());
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }
}
