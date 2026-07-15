<?php

declare(strict_types=1);

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * AuthController
 *
 * Handles authentication operations (register, login, logout)
 */
class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
            'email.unique' => 'L\'adresse e-mail est déjà utilisée',
        ]);

        try {
            $user = DB::transaction(function () use ($request): User {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                $user->assignRole('user');
                $user->sendEmailVerificationNotification();

                return $user;
            });

            // Explicitly log the user in to establish a session
            Auth::login($user);

            // Create token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Inscription réussie. Un code de vérification vous a été envoyé par email.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'roles' => $user->getRoleNames(),
                ],
                'token' => $token,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Rate limiting
        $key = 'login.'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ["Trop de tentatives. Réessayez dans {$seconds} secondes."],
            ]);
        }

        // Attempt authentication
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        RateLimiter::clear($key);

        $user = Auth::user();

        // Check for two factor authentication
        if ($user->hasEnabledTwoFactorAuthentication()) {
            // Logout and require 2FA challenge
            Auth::logout();
            $request->session()->put('login.id', $user->id);
            $request->session()->put('login.remember', $request->boolean('remember'));

            return response()->json([
                'two_factor' => true,
                'email' => $user->email,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle two-factor authentication challenge
     */
    public function twoFactorLogin(Request $request, \Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider $provider): JsonResponse
    {
        $userId = $request->session()->get('login.id');

        if (! $userId) {
            return response()->json([
                'message' => 'La session a expiré.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = User::findOrFail($userId);

        $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        if ($code = $request->code) {
            if (! $provider->verify(decrypt($user->two_factor_secret), $code)) {
                throw ValidationException::withMessages([
                    'code' => ['Le code d\'authentification fourni est invalide.'],
                ]);
            }
        } elseif ($recoveryCode = $request->recovery_code) {
            $userRecoveryCode = collect($user->recoveryCodes())->first(function ($code) use ($recoveryCode) {
                return hash_equals($code, $recoveryCode);
            });

            if (! $userRecoveryCode) {
                throw ValidationException::withMessages([
                    'recovery_code' => ['Le code de secours fourni est invalide.'],
                ]);
            }

            $user->replaceRecoveryCode($userRecoveryCode);
        } else {
            throw ValidationException::withMessages([
                'code' => ['Un code est requis.'],
            ]);
        }

        Auth::login($user, $request->session()->get('login.remember', false));
        $request->session()->forget(['login.id', 'login.remember']);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token if it exists and is deletable (not a TransientToken)
        $token = $request->user()->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        // Invalidate session and regenerate CSRF token for stateful sessions
        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        // If authenticated via token but no session, establish session for web routes
        if ($user && ! Auth::guard('web')->check() && $request->hasSession()) {
            Auth::guard('web')->login($user);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id],
        ]);

        try {
            $user->update($request->only(['name', 'email']));

            return response()->json([
                'message' => 'Profil mis à jour',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'different:current_password',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
        ]);

        $user = $request->user();

        // Verify current password
        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        try {
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            // Revoke all tokens except current
            $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

            return response()->json([
                'message' => 'Mot de passe modifié avec succès',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du changement de mot de passe',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send email verification notification
     */
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email déjà vérifié',
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Un code de vérification vous a été envoyé par email',
        ]);
    }

    /**
     * Verify email address with PIN
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email déjà vérifié',
            ]);
        }

        if (! $user->email_verification_pin || ! $user->email_verification_pin_expires_at) {
            throw ValidationException::withMessages([
                'pin' => ['Aucun code de vérification actif.'],
            ]);
        }

        if (Carbon::now()->gt($user->email_verification_pin_expires_at)) {
            throw ValidationException::withMessages([
                'pin' => ['Le code de vérification a expiré.'],
            ]);
        }

        if (! Hash::check($request->pin, $user->email_verification_pin)) {
            throw ValidationException::withMessages([
                'pin' => ['Code de vérification incorrect.'],
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Clear PIN
        $user->forceFill([
            'email_verification_pin' => null,
            'email_verification_pin_expires_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Email vérifié avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Send password reset PIN
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        // Rate limiting
        $key = 'forgot-password.'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ["Trop de tentatives. Réessayez dans {$seconds} secondes."],
            ]);
        }

        if (! $user) {
            RateLimiter::hit($key, 300); // 5 minutes

            // To prevent user enumeration, we return success even if email not found
            // But for development/debugging, maybe we want to know?
            // Let's follow standard security practice and return success
            return response()->json([
                'message' => 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.',
            ]);
        }

        // Generate 6-digit PIN
        $pin = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store PIN and expiry
        $user->forceFill([
            'password_reset_pin' => Hash::make($pin),
            'password_reset_pin_expires_at' => Carbon::now()->addMinutes(5),
        ])->save();

        // Send notification
        $user->notify(new \App\Notifications\CustomResetPassword($pin));

        RateLimiter::clear($key);

        return response()->json([
            'message' => 'Email de réinitialisation envoyé',
        ]);
    }

    /**
     * Reset password with PIN
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
            'pin.size' => 'Le code PIN doit contenir 6 chiffres',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Aucun compte trouvé avec cet email.'],
            ]);
        }

        if (! $user->password_reset_pin || ! $user->password_reset_pin_expires_at) {
            throw ValidationException::withMessages([
                'pin' => ['Aucun code de réinitialisation actif.'],
            ]);
        }

        if (Carbon::now()->gt($user->password_reset_pin_expires_at)) {
            throw ValidationException::withMessages([
                'pin' => ['Le code de réinitialisation a expiré.'],
            ]);
        }

        if (! Hash::check($request->pin, $user->password_reset_pin)) {
            throw ValidationException::withMessages([
                'pin' => ['Code PIN incorrect.'],
            ]);
        }

        // Reset password
        $user->forceFill([
            'password' => Hash::make($request->password),
            'password_reset_pin' => null,
            'password_reset_pin_expires_at' => null,
        ])->setRememberToken(Str::random(60))->save();

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès',
        ]);
    }
}
