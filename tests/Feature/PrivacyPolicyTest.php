<?php

namespace Tests\Feature;

use App\Models\PrivacyRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PrivacyPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_privacy_policy_is_publicly_accessible(): void
    {
        $this->withoutVite();

        $response = $this->get('/privacy');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('privacy')
                ->where('contactEmail', 'privacy@maliyaflow.com')
                ->where('controllerName', 'MaliyaFlow')
                ->has('updatedAt')
            );
    }

    public function test_legacy_privacy_url_redirects_to_canonical_page(): void
    {
        $this->get('/privacy-policy')->assertRedirect('/privacy');
    }

    public function test_a_user_can_submit_a_data_export_request(): void
    {
        Mail::fake();

        $response = $this->from('/privacy')->post('/privacy/requests', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'request_type' => 'export',
            'message' => 'Je souhaite recevoir mes données au format JSON.',
            'confirmation' => false,
            'website' => '',
        ]);

        $response->assertRedirect('/privacy')
            ->assertSessionHas('privacy_request_received.reference', 'PRIV-000001');

        $this->assertDatabaseHas(PrivacyRequest::class, [
            'email' => 'jane@example.com',
            'request_type' => 'export',
            'status' => 'received',
        ]);
    }

    public function test_deletion_request_requires_explicit_confirmation(): void
    {
        $response = $this->from('/privacy')->post('/privacy/requests', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'request_type' => 'deletion',
            'message' => '',
            'confirmation' => false,
            'website' => '',
        ]);

        $response->assertRedirect('/privacy')->assertSessionHasErrors('confirmation');
        $this->assertDatabaseCount('privacy_requests', 0);
    }
}
