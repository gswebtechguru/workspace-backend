<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMessage extends Model
{
    protected $fillable = [
        'project_id', 'sender_id', 'content', 'reply_to_id',
        'is_pinned', 'linked_task_id', 'is_deleted', 'edited_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_deleted' => 'boolean',
        'edited_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyTo()
    {
        return $this->belongsTo(ProjectMessage::class, 'reply_to_id');
    }

    public function replies()
    {
        return $this->hasMany(ProjectMessage::class, 'reply_to_id');
    }

    public function mentions()
    {
        return $this->hasMany(MessageMention::class, 'message_id');
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class, 'message_id');
    }

    public function linkedTask()
    {
        return $this->belongsTo(Task::class, 'linked_task_id');
    }
}

class MessageMention extends Model
{
    protected $fillable = ['message_id', 'user_id'];

    public function message()
    {
        return $this->belongsTo(ProjectMessage::class, 'message_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'attachment_id'];

    public function message()
    {
        return $this->belongsTo(ProjectMessage::class, 'message_id');
    }

    public function attachment()
    {
        return $this->belongsTo(Attachment::class);
    }
}
