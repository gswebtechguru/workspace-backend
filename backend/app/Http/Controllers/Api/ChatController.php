<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\Attachment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && !$project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $project->messages()
            ->with(['sender.employeeProfile', 'replyTo.sender', 'mentions.user', 'attachments.attachment'])
            ->where('is_deleted', false)
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(Request $request, Project $project)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && !$project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'reply_to_id' => 'nullable|exists:project_messages,id',
        ]);

        $message = ProjectMessage::create([
            'project_id' => $project->id,
            'sender_id' => $user->id,
            'content' => $validated['content'],
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        // Detect mentions
        preg_match_all('/@(\w+\s\w+)/', $validated['content'], $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $mention) {
                $mentioned = $project->members()
                    ->whereHas('user', function ($q) use ($mention) {
                        $parts = explode(' ', $mention);
                        $q->where('name', 'like', '%' . $parts[0] . '%');
                    })
                    ->first();
                if ($mentioned) {
                    $message->mentions()->create(['user_id' => $mentioned->user_id]);
                    
                    Notification::create([
                        'user_id' => $mentioned->user_id,
                        'type' => 'mention',
                        'title' => 'You were mentioned',
                        'message' => $user->name . ' mentioned you in ' . $project->title,
                        'entity_id' => $message->id,
                        'entity_type' => 'message',
                    ]);
                }
            }
        }

        // Notify project members
        foreach ($project->members as $member) {
            if ($member->user_id !== $user->id) {
                Notification::create([
                    'user_id' => $member->user_id,
                    'type' => 'message',
                    'title' => 'New message in ' . $project->title,
                    'message' => $user->name . ': ' . substr($validated['content'], 0, 50),
                    'entity_id' => $project->id,
                    'entity_type' => 'project',
                ]);
            }
        }

        return response()->json($message->load('sender.employeeProfile'), 201);
    }

    public function destroy(ProjectMessage $message)
    {
        $tenMinutesAgo = now()->subMinutes(10);
        
        if ($message->sender_id !== Auth::id() || $message->created_at < $tenMinutesAgo) {
            return response()->json(['message' => 'Cannot delete this message'], 403);
        }

        $message->update(['is_deleted' => true]);

        return response()->json(['message' => 'Message deleted']);
    }

    public function uploadAttachment(Request $request, ProjectMessage $message)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('message-attachments', 'private');

        $attachment = Attachment::create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
        ]);

        $message->attachments()->create(['attachment_id' => $attachment->id]);

        return response()->json($attachment, 201);
    }
}
