<?php

namespace App\Http\Controllers;

use App\Models\PrivacyRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PrivacyController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('privacy', [
            'contactEmail' => config('privacy.contact_email'),
            'controllerName' => config('privacy.controller_name'),
            'controllerAddress' => config('privacy.controller_address'),
            'updatedAt' => config('privacy.updated_at'),
            'prefill' => [
                'name' => $request->user()?->name ?? '',
                'email' => $request->user()?->email ?? '',
            ],
            'requestReceived' => $request->session()->get('privacy_request_received'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'request_type' => [
                'required',
                Rule::in(['contact', 'access', 'export', 'deletion', 'rectification', 'restriction', 'objection']),
            ],
            'message' => ['nullable', 'string', 'max:5000', Rule::requiredIf($request->input('request_type') === 'contact')],
            'confirmation' => ['nullable', 'accepted_if:request_type,deletion'],
            'website' => ['nullable', 'size:0'],
        ]);

        $privacyRequest = PrivacyRequest::create([
            'user_id' => $request->user()?->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'request_type' => $validated['request_type'],
            'message' => $validated['message'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
        ]);

        try {
            Mail::raw(
                "Nouvelle demande relative à la vie privée #{$privacyRequest->id}\n\n"
                ."Type : {$privacyRequest->request_type}\n"
                ."Nom : {$privacyRequest->name}\n"
                ."Email : {$privacyRequest->email}\n\n"
                .($privacyRequest->message ?? 'Aucun message complémentaire.'),
                fn ($message) => $message
                    ->to(config('privacy.contact_email'))
                    ->replyTo($privacyRequest->email, $privacyRequest->name)
                    ->subject("[MaliyaFlow] Demande vie privée #{$privacyRequest->id}")
            );
        } catch (Throwable $exception) {
            Log::warning('Privacy request notification email could not be sent.', [
                'privacy_request_id' => $privacyRequest->id,
                'exception' => $exception->getMessage(),
            ]);
        }

        return back()->with('privacy_request_received', [
            'reference' => sprintf('PRIV-%06d', $privacyRequest->id),
            'type' => $privacyRequest->request_type,
        ]);
    }
}
