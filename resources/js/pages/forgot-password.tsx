import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { IconInput } from '@/components/ui/icon-input'; // <-- Utilisez notre composant
import { useAuth, useForgotPasswordForm } from '@/hooks/useAuth';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForgotPasswordForm();

    const onSubmit = async (values: any) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await forgotPassword(values.email);
            setSuccess(true);
            form.reset();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la demande',
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
                        <img src="/logo.png" alt="" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        MaliyaPay
                    </h1>
                    <p className="mt-2 text-lg text-white/60">
                        Réinitialisez votre mot de passe
                    </p>
                </div>

                {/* Carte principale avec effet Glassmorphism */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                    <div className="rounded-xl bg-slate-900/80 p-6 sm:p-8">
                        {/* Messages de succès ou d'erreur avec style glassmorphism */}
                        {success && (
                            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Email envoyé !
                                        </p>
                                        <p className="text-xs opacity-80">
                                            Vérifiez votre boîte mail pour le
                                            lien de réinitialisation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 backdrop-blur-sm">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Formulaire */}
                        {!success && (
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-5"
                                >
                                    <div className="text-center">
                                        <h2 className="text-2xl font-semibold text-white">
                                            Mot de passe oublié ?
                                        </h2>
                                        <p className="mt-2 text-sm text-white/60">
                                            Entrez votre e-mail pour recevoir un
                                            lien de réinitialisation.
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">
                                                    E-mail
                                                </FormLabel>
                                                <FormControl>
                                                    <IconInput
                                                        icon={Mail}
                                                        type="email"
                                                        placeholder="vous@exemple.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="h-12 w-full bg-gradient-to-r from-emerald-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : null}
                                        Envoyer le lien
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* Lien de retour */}
                        <div className="mt-6 text-center">
                            <a
                                href="/login"
                                className="text-sm font-medium text-emerald-400 transition-colors duration-200 hover:text-emerald-300 hover:underline"
                            >
                                Retour à la connexion
                            </a>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-white/40">
                    Sécurité • Vos données sont chiffrées
                </p>
            </div>
        </div>
    );
}
