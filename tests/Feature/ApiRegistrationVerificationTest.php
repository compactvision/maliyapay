<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ApiRegistrationVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_a_six_digit_email_verification_code(): void
    {
        Notification::fake();
        Role::findOrCreate('user', 'web');

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'registration@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.email', 'registration@example.com');

        $user = User::where('email', 'registration@example.com')->firstOrFail();

        $this->assertNotNull($user->email_verification_pin);
        $this->assertNotNull($user->email_verification_pin_expires_at);
        $this->assertTrue(
            $user->email_verification_pin_expires_at->between(
                now()->addMinutes(4),
                now()->addMinutes(5),
            ),
        );

        Notification::assertSentTo(
            $user,
            CustomVerifyEmail::class,
            function (CustomVerifyEmail $notification) use ($user): bool {
                return preg_match('/^\d{6}$/', $notification->pin) === 1
                    && Hash::check($notification->pin, $user->email_verification_pin);
            },
        );
    }

    public function test_resending_replaces_the_active_verification_code(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create([
            'email_verification_pin' => Hash::make('111111'),
            'email_verification_pin_expires_at' => now()->subMinute(),
        ]);

        $response = $this
            ->actingAs($user, 'sanctum')
            ->postJson('/api/auth/email/verification-notification');

        $response->assertOk();

        $user->refresh();

        Notification::assertSentTo(
            $user,
            CustomVerifyEmail::class,
            fn (CustomVerifyEmail $notification): bool => preg_match('/^\d{6}$/', $notification->pin) === 1
                && Hash::check($notification->pin, $user->email_verification_pin),
        );
    }

    public function test_user_can_verify_email_with_the_sent_code(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $sentPin = null;

        $user->sendEmailVerificationNotification();

        Notification::assertSentTo(
            $user,
            CustomVerifyEmail::class,
            function (CustomVerifyEmail $notification) use (&$sentPin): bool {
                $sentPin = $notification->pin;

                return true;
            },
        );

        $response = $this
            ->actingAs($user, 'sanctum')
            ->postJson('/api/auth/email/verify', ['pin' => $sentPin]);

        $response
            ->assertOk()
            ->assertJsonPath('user.email_verified_at', fn ($value) => $value !== null);

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNull($user->fresh()->email_verification_pin);
    }
}
