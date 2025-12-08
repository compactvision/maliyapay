import { GuestGuard } from '@/components/auth/GuestGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useLoginForm, useRegisterForm } from '@/hooks/useAuth';
import { Link } from '@inertiajs/react';
import { Loader2, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export default function Auth() {
    const { login, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginForm = useLoginForm();
    const registerForm = useRegisterForm();

    const onLogin = async (values: any) => {
        setIsLoading(true);
        setError(null);
        try {
            await login(values);
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
            window.location.href = '/';
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erreur d'inscription",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GuestGuard>
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
                            Gérez vos finances en toute simplicité
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <Card className="border-0 shadow-xl">
                        <Tabs defaultValue="login" className="w-full">
                            <CardHeader className="pb-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">
                                        Connexion
                                    </TabsTrigger>
                                    <TabsTrigger value="register">
                                        Inscription
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent>
                                <TabsContent value="login" className="mt-0">
                                    <Form {...loginForm}>
                                        <form
                                            onSubmit={loginForm.handleSubmit(
                                                onLogin,
                                            )}
                                            className="space-y-4"
                                        >
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="vous@exemple.com"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
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
                                                        <FormLabel>
                                                            Mot de passe
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-center justify-end">
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Mot de passe oublié ?
                                                </Link>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isLoading}
                                                variant="primary"
                                            >
                                                {isLoading && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Se connecter
                                            </Button>
                                        </form>
                                    </Form>
                                </TabsContent>

                                <TabsContent value="register" className="mt-0">
                                    <Form {...registerForm}>
                                        <form
                                            onSubmit={registerForm.handleSubmit(
                                                onRegister,
                                            )}
                                            className="space-y-4"
                                        >
                                            <FormField
                                                control={registerForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nom
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Votre nom"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
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
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="vous@exemple.com"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
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
                                                        <FormLabel>
                                                            Mot de passe
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
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
                                                        <FormLabel>
                                                            Confirmer le mot de
                                                            passe
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isLoading}
                                                variant="primary"
                                            >
                                                {isLoading && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Créer un compte
                                            </Button>
                                        </form>
                                    </Form>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Application hors-ligne • Vos données restent sur votre
                        appareil
                    </p>
                </div>
            </div>
        </GuestGuard>
    );
}
