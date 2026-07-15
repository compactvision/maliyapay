import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { router } from '@inertiajs/react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function VerifyEmail() {
    const { sendVerificationEmail, user, verifyEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [pin, setPin] = useState('');
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

    const handleVerify = async (event: FormEvent) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(pin)) {
            setError('Saisissez le code à 6 chiffres reçu par email.');
            return;
        }

        setIsVerifying(true);
        setError(null);
        setMessage(null);

        try {
            await verifyEmail(pin);
            setMessage('Votre adresse email est maintenant vérifiée.');
            router.visit('/');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Code de vérification invalide',
            );
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <AuthGuard requireEmailVerification={false}>
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
                {/* Background animé avec la palette émeraude/sky-blue */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
                    <div className="animation-delay-2000 absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-sky-500 opacity-20 blur-xl"></div>
                    <div className="animation-delay-4000 absolute top-72 right-0 bottom-0 h-72 w-72 animate-pulse rounded-full bg-teal-500 opacity-20 blur-xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-xl p-4">
                    {/* Header avec le logo et le titre */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-400 shadow-2xl shadow-emerald-500/25">
                            <img src="/logo.png" alt="MaliyaPay Logo" />
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
                                    Nous avons envoyé un e-mail de vérification
                                    à :
                                </p>
                                <p className="mt-2 text-lg font-medium break-words text-emerald-400">
                                    {user?.email}
                                </p>
                                <p className="mt-4 text-sm text-white/60">
                                    Saisissez le code à 6 chiffres reçu par
                                    email. Il reste valable pendant 5 minutes.
                                </p>
                            </div>

                            <form
                                onSubmit={handleVerify}
                                className="mt-8 space-y-4"
                            >
                                <Input
                                    value={pin}
                                    onChange={(event) =>
                                        setPin(
                                            event.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6),
                                        )
                                    }
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    aria-label="Code de vérification à 6 chiffres"
                                    placeholder="000000"
                                    className="h-14 border-white/10 bg-white/5 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/20"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                                    disabled={isVerifying || pin.length !== 6}
                                >
                                    {isVerifying ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    Vérifier mon email
                                </Button>
                            </form>

                            <div className="mt-4">
                                <Button
                                    type="button"
                                    onClick={handleResend}
                                    variant="outline"
                                    className="h-12 w-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    Renvoyer un nouveau code
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
