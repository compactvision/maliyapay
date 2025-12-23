<?php

declare(strict_types=1);

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * PinController
 * 
 * Handles PIN-based authentication and auto-lock settings
 */
class PinController extends Controller
{
    /**
     * Set or update user PIN
     */
    public function setup(Request $request): JsonResponse
    {
        $request->validate([
            'pin_code' => ['required', 'string', 'size:4', 'regex:/^[0-9]+$/'],
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'pin_code' => Hash::make($request->pin_code),
            'auto_lock_enabled' => true,
        ]);

        return response()->json([
            'message' => 'Code PIN configuré avec succès',
            'auto_lock_enabled' => true,
        ]);
    }

    /**
     * Verify PIN and return a new token
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'pin_code' => ['required', 'string', 'size:4'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->pin_code || !Hash::check($request->pin_code, $user->pin_code)) {
            return response()->json([
                'message' => 'Code PIN incorrect.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Login the user to establish a session for web/Inertia requests
        Auth::login($user);

        // Issue new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Déverrouillage réussi',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'auto_lock_enabled' => $user->auto_lock_enabled,
                'auto_lock_timeout' => $user->auto_lock_timeout,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    /**
     * Toggle auto-lock feature
     */
    public function toggleAutoLock(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $user = $request->user();
        
        if ($request->enabled && !$user->pin_code) {
             return response()->json([
                'message' => 'Veuillez d\'abord configurer un code PIN.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->update([
            'auto_lock_enabled' => $request->enabled,
        ]);

        return response()->json([
            'message' => $request->enabled ? 'Verrouillage automatique activé' : 'Verrouillage automatique désactivé',
            'auto_lock_enabled' => $user->auto_lock_enabled,
        ]);
    }

    /**
     * Update PIN settings (timeout)
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'auto_lock_timeout' => ['required', 'integer', 'in:30,60,300,900,1800'],
        ]);

        $user = $request->user();
        $user->update([
            'auto_lock_timeout' => $request->auto_lock_timeout,
        ]);

        return response()->json([
            'message' => 'Paramètres de verrouillage mis à jour',
            'user' => array_merge($user->toArray(), [
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ]),
        ]);
    }
}
