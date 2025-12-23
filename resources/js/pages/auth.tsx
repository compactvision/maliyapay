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
import { useAuth, useLoginForm, useRegisterForm } from '@/hooks/useAuth';
import { useFormErrorScroll } from '@/hooks/useFormErrorScroll';
import { Link } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'; // <-- Importer Eye et EyeOff
import { useState } from 'react';

export default function Auth() {
    const { login, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(true);

    // États pour la visibilité des mots de passe
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
        useState(false);

    const loginForm = useLoginForm();
    const registerForm = useRegisterForm();

    // Auto-scroll to first error
    useFormErrorScroll(loginForm.formState.errors);
    useFormErrorScroll(registerForm.formState.errors);

    const onLogin = async (values: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await login(values);
            if (response?.two_factor) {
                // Redirect to 2FA challenge page
                window.location.href = '/two-factor-challenge';
                return;
            }
            window.location.href = '/';
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Erreur de connexion',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async (values: any) => {
        setIsLoading(true);
        setError(null);
        try {
            await register(values);
            window.location.href = '/settings/security?onboarding=true';
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erreur d'inscription",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
                <div className="animation-delay-2000 absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-sky-500 opacity-20 blur-xl"></div>
                <div className="animation-delay-4000 absolute top-72 right-0 bottom-0 h-72 w-72 animate-pulse rounded-full bg-teal-500 opacity-20 blur-xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-xl p-4">
                {' '}
                {/* MODIFICATION: max-w-lg -> max-w-xl */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex justify-center">
                        <img
                            src="/logo.png"
                            alt="Maliya Logo"
                            className="h-40 w-auto drop-shadow-xl"
                        />
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        MaliyaFlow
                    </h1>
                    <p className="mt-2 text-lg text-white/60">
                        Gérez vos finances en toute simplicité
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                    <div className="rounded-xl bg-slate-900/80 p-6">
                        {error && (
                            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 backdrop-blur-sm">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1 backdrop-blur-sm">
                            <button
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isLogin ? 'bg-white text-slate-900 shadow-lg' : 'text-white/70'}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Connexion
                            </button>
                            <button
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${!isLogin ? 'bg-white text-slate-900 shadow-lg' : 'text-white/70'}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Inscription
                            </button>
                        </div>

                        {isLogin && (
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit(onLogin)}
                                    className="space-y-5"
                                >
                                    <FormField
                                        control={loginForm.control}
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
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">
                                                    Mot de passe
                                                </FormLabel>
                                                <FormControl>
                                                    <IconInput
                                                        icon={Lock}
                                                        trailingIcon={
                                                            showLoginPassword
                                                                ? EyeOff
                                                                : Eye
                                                        }
                                                        onTrailingIconClick={() =>
                                                            setShowLoginPassword(
                                                                !showLoginPassword,
                                                            )
                                                        }
                                                        type={
                                                            showLoginPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="•••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-end">
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-emerald-400 hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 w-full bg-gradient-to-r from-emerald-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : null}
                                        Se connecter
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {!isLogin && (
                            <Form {...registerForm}>
                                <form
                                    onSubmit={registerForm.handleSubmit(
                                        onRegister,
                                    )}
                                    className="space-y-5"
                                >
                                    <FormField
                                        control={registerForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">
                                                    Nom
                                                </FormLabel>
                                                <FormControl>
                                                    <IconInput
                                                        icon={User}
                                                        placeholder="Votre nom"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
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
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">
                                                    Mot de passe
                                                </FormLabel>
                                                <FormControl>
                                                    <IconInput
                                                        icon={Lock}
                                                        trailingIcon={
                                                            showRegisterPassword
                                                                ? EyeOff
                                                                : Eye
                                                        }
                                                        onTrailingIconClick={() =>
                                                            setShowRegisterPassword(
                                                                !showRegisterPassword,
                                                            )
                                                        }
                                                        type={
                                                            showRegisterPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="•••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
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
                                                            showRegisterConfirmPassword
                                                                ? EyeOff
                                                                : Eye
                                                        }
                                                        onTrailingIconClick={() =>
                                                            setShowRegisterConfirmPassword(
                                                                !showRegisterConfirmPassword,
                                                            )
                                                        }
                                                        type={
                                                            showRegisterConfirmPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="•••••••"
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
                                        Créer un compte
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
                <p className="mt-8 text-center text-sm text-white/40">
                    Application sécurisée • Vos données sont chiffrées
                </p>
            </div>
        </div>
    );
}
