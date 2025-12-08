<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends BaseResetPassword
{
    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        // L'URL de reset est générée automatiquement par Laravel en utilisant la route nommée 'password.reset'
        // Nous ajoutons l'email en query param comme c'est souvent requis par le frontend
        $url = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe - MaliyaPay')
            ->view('emails.reset', [
                'user' => $notifiable,
                'url' => $url,
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]);
    }
}
