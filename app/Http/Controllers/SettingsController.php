<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class SettingsController extends Controller
{
    /**
     * Affiche la page des paramètres généraux.
     */
    public function index(Request $request)
    {
        return Inertia::render('settings', [
            'user' => $request->user(),
            'status' => session('status'),
        ]);
    }

    /**
     * Met à jour les préférences de notification.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'receive_notifications' => 'required|boolean',
        ]);

        $user = $request->user();
        $user->receive_notifications = $request->boolean('receive_notifications');
        $user->save();

        return back()->with('status', 'settings-updated');
    }

    /**
     * Met à jour la langue de l'utilisateur.
     */
    public function updateLanguage(Request $request): RedirectResponse
    {
        $request->validate([
            'language' => 'required|string|in:fr,en',
        ]);

        $user = $request->user();
        $user->language = $request->language;
        $user->save();

        return back()->with('status', 'language-updated');
    }
}
