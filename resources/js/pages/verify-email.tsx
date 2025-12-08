import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, Loader2, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function VerifyEmail() {
    const { sendVerificationEmail, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResend = async () => {
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            await sendVerificationEmail();
            setMessage('Email de vérification envoyé avec succès !');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l'envoi de l'email",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthGuard requireEmailVerification={false}>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
                <div className="animate-fade-in w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                            <Sparkles className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            MaliyaPay
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Vérifiez votre adresse email
                        </p>
                    </div>

                    {message && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <p className="text-sm">{message}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <Card className="border-0 shadow-xl">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-center">
                                <Mail className="h-12 w-12 text-primary" />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">
                                    Vérification requise
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Un email de vérification a été envoyé à{' '}
                                    <strong>{user?.email}</strong>. Veuillez
                                    cliquer sur le lien dans l'email pour
                                    vérifier votre compte.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleResend}
                                    className="w-full"
                                    disabled={isLoading}
                                    variant="primary"
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Renvoyer l'email
                                </Button>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('auth_token');
                                        window.location.href = '/login';
                                    }}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Application hors-ligne • Vos données restent sur votre
                        appareil
                    </p>
                </div>
            </div>
        </AuthGuard>
    );
}
