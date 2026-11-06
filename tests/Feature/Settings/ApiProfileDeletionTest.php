<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiProfileDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_bearer_token_holder_can_delete_their_account_with_the_current_password(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $token = $user->createToken('mobile');
        $otherDevice = $user->createToken('tablet');

        $this->withToken($token->plainTextToken)
            ->deleteJson('/api/auth/profile', [
                'password' => 'password',
                'user_id' => $otherUser->id,
            ])
            ->assertNoContent();

        $this->assertModelMissing($user);
        $this->assertModelExists($otherUser);
        $this->assertModelMissing($token->accessToken);
        $this->assertModelMissing($otherDevice->accessToken);
    }

    public function test_wrong_password_preserves_the_account_and_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('mobile');

        $this->withToken($token->plainTextToken)
            ->deleteJson('/api/auth/profile', ['password' => 'incorrect'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->assertModelExists($user);
        $this->assertModelExists($token->accessToken);
    }

    public function test_account_deletion_requires_authentication(): void
    {
        $this->deleteJson('/api/auth/profile', ['password' => 'password'])
            ->assertUnauthorized();
    }
}
