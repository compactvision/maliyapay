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
import { useAuth, useResetPasswordForm } from '@/hooks/useAuth';
import { Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useResetPasswordForm(token, email || '');

    const onSubmit = async (values: any) => {
        setIsLoading(true);
        setError(null);

        try {
            await resetPassword(values);
            // Redirect to login on success
            window.location.href = '/login?reset=success';
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
                            Créer un nouveau mot de passe
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <Card className="border-0 shadow-xl">
                        <CardHeader className="pb-4">
                            <h2 className="text-center text-xl font-semibold">
                                Réinitialiser le mot de passe
                            </h2>
                            <p className="text-center text-sm text-muted-foreground">
                                Entrez votre nouveau mot de passe
                            </p>
                        </CardHeader>

                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder="vous@exemple.com"
                                                            className="pl-10"
                                                            {...field}
                                                            disabled
                                                        />
                                                    </div>
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
                                                <FormLabel>
                                                    Nouveau mot de passe
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
                                        control={form.control}
                                        name="password_confirmation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirmer le mot de passe
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
                                        Réinitialiser le mot de passe
                                    </Button>

                                    <div className="text-center">
                                        <a
                                            href="/login"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Retour à la connexion
                                        </a>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
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
