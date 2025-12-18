import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { IconInput } from '@/components/ui/icon-input';
import { useAuth, useResetPasswordForm } from '@/hooks/useAuth';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useResetPasswordForm(token, email || '');

    const onSubmit = async (values: any) => {
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            await resetPassword(values);
            setMessage('Mot de passe réinitialisé avec succès !');
            // Redirect to login on success
            setTimeout(() => {
                window.location.href = '/login?reset=success';
            }, 1500);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la réinitialisation',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                        <img
                            src="/logo.png"
                            alt="MaliyaPay Logo"
                            className="h-10 w-10"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        MaliyaPay
                    </h1>
                    <p className="mt-2 text-lg text-white/60">
                        Réinitialiser votre mot de passe
                    </p>
                </div>

                {/* Carte principale avec effet Glassmorphism */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                    <div className="rounded-xl bg-slate-900/80 p-6 sm:p-8">
                        {/* Icône du cadenas proéminente */}
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-400/20 shadow-lg">
                            <Lock className="h-8 w-8 text-emerald-400" />
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
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-semibold text-white">
                                Créer un nouveau mot de passe
                            </h2>
                            <p className="mt-4 text-sm text-white/60">
                                Entrez votre nouveau mot de passe ci-dessous
                            </p>
                        </div>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <IconInput
                                                    icon={Mail}
                                                    type="email"
                                                    placeholder="vous@exemple.com"
                                                    disabled
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">
                                                Nouveau mot de passe
                                            </FormLabel>
                                            <FormControl>
                                                <IconInput
                                                    icon={Lock}
                                                    trailingIcon={
                                                        showPassword
                                                            ? EyeOff
                                                            : Eye
                                                    }
                                                    onTrailingIconClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">
                                                Confirmer le mot de passe
                                            </FormLabel>
                                            <FormControl>
                                                <IconInput
                                                    icon={Lock}
                                                    trailingIcon={
                                                        showConfirmPassword
                                                            ? EyeOff
                                                            : Eye
                                                    }
                                                    onTrailingIconClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword,
                                                        )
                                                    }
                                                    type={
                                                        showConfirmPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Bouton d'action principal */}
                                <Button
                                    type="submit"
                                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    Réinitialiser le mot de passe
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-white/40">
                    Sécurité • Vos données sont chiffrées
                </p>
            </div>
        </div>
    );
}
