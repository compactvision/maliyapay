import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
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
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
                {/* Background animé avec la palette émeraude/sky-blue */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
                    <div className="absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-sky-500 opacity-20 blur-xl animation-delay-2000"></div>
                    <div className="absolute bottom-0 right-0 top-72 h-72 w-72 animate-pulse rounded-full bg-teal-500 opacity-20 blur-xl animation-delay-4000"></div>
                </div>

                <div className="relative z-10 w-full max-w-xl p-4">
                    {/* Header avec le logo et le titre */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-400 shadow-2xl shadow-emerald-500/25">
                            <img src="/maliya-logo.png" alt="MaliyaPay Logo" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">
                            MaliyaPay
                        </h1>
                        <p className="mt-2 text-lg text-white/60">
                            Vérifiez votre adresse e-mail
                        </p>
                    </div>

                    {/* Carte principale avec effet Glassmorphism */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-xl bg-slate-900/80 p-6 sm:p-8">
                            {/* Icône de l'email proéminente */}
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-400/20 shadow-lg">
                                <Mail className="h-8 w-8 text-emerald-400" />
                            </div>

                            {/* Messages de succès ou d'erreur avec style glassmorphism */}
                            {message && (
                                <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="text-sm">{message}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 backdrop-blur-sm">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Contenu principal */}
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-white">
                                    Un dernier pas...
                                </h2>
                                <p className="mt-4 text-sm text-white/60">
                                    Nous avons envoyé un e-mail de vérification à :
                                </p>
                                <p className="mt-2 break-words text-lg font-medium text-emerald-400">
                                    {user?.email}
                                </p>
                                <p className="mt-4 text-sm text-white/60">
                                    Cliquez sur le lien dans l'e-mail pour activer votre compte.
                                    Si vous ne le voyez pas, vérifiez vos spams.
                                </p>
                            </div>

                            {/* Bouton d'action principal */}
                            <div className="mt-8">
                                <Button
                                    onClick={handleResend}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    Renvoyer l'e-mail
                                </Button>
                            </div>

                            {/* Lien de déconnexion */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('auth_token');
                                        window.location.href = '/login';
                                    }}
                                    className="text-sm text-emerald-400 transition-colors duration-200 hover:text-emerald-300 hover:underline"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-white/40">
                        Sécurité • Vos données sont chiffrées
                    </p>
                </div>
            </div>
        </AuthGuard>
    );
}