<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_can_be_reset_with_a_valid_pin(): void
    {
        $user = User::factory()->create([
            'remember_token' => 'old-remember-token',
            'password_reset_pin' => Hash::make('012345'),
            'password_reset_pin_expires_at' => now()->addMinutes(5),
        ]);
        $user->createToken('mobile');

        $payload = [
            'email' => $user->email,
            'pin' => '012345',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ];

        $this->postJson('/api/auth/reset-password', $payload)->assertOk();

        $user->refresh();

        $this->assertTrue(Hash::check('NewPassword1', $user->password));
        $this->assertNull($user->password_reset_pin);
        $this->assertNull($user->password_reset_pin_expires_at);
        $this->assertNotEmpty($user->getRememberToken());
        $this->assertNotSame('old-remember-token', $user->getRememberToken());
        $this->assertSame(0, $user->tokens()->count());

        $this->postJson('/api/auth/reset-password', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('pin');
    }
}
