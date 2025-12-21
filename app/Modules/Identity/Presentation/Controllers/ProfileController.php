<?php

declare(strict_types=1);

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('profile', [
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($request->user()?->id)],
            'avatar' => ['nullable', 'image', 'max:2048'], // Max 2MB
            'play_notification_sound' => ['boolean'],
        ]);

        // On retire l'avatar des données validées pour ne pas écraser l'existant avec null par mégarde
        unset($validated['avatar']);
        
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Logic d'upload d'avatar
        if ($request->hasFile('avatar')) {
             // Delete old avatar if exists
             if ($user->avatar) {
                // Convert /storage/images/users/xyz.jpg -> images/users/xyz.jpg
                $oldPath = str_replace('/storage/', '', $user->avatar);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('avatar')->store('images/users', 'public');
            $user->avatar = '/storage/' . $path;
        }

        $user->save(); // Save first
        
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                ]),
            ]);
        }

        return Redirect::route('profile.show');
    }
}
