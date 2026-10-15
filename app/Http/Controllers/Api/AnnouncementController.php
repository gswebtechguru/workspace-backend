<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('creator')
            ->orderBy('published_at', 'desc')
            ->paginate(20);

        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'audience' => 'required|in:all,department,team,project',
            'expires_at' => 'nullable|date',
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'audience' => $validated['audience'],
            'published_at' => now(),
            'expires_at' => $validated['expires_at'] ?? null,
            'created_by' => Auth::id(),
        ]);

        // Notify all active users
        User::where('is_active', true)->each(function ($user) use ($announcement) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'announcement',
                'title' => 'New Announcement',
                'message' => $announcement->title,
                'entity_id' => $announcement->id,
                'entity_type' => 'announcement',
            ]);
        });

        return response()->json($announcement, 201);
    }

    public function markAsRead(Announcement $announcement)
    {
        $announcement->reads()->updateOrCreate(
            ['user_id' => Auth::id()],
            ['read_at' => now()]
        );

        return response()->json(['message' => 'Marked as read']);
    }
}
