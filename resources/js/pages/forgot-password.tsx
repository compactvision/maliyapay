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
import { useAuth, useForgotPasswordForm } from '@/hooks/useAuth';
import { CheckCircle2, Loader2, Mail, Sparkles } from 'lucide-react';
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
                            Réinitialiser votre mot de passe
                        </p>
                    </div>

                    {success && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Email envoyé !
                                    </p>
                                    <p className="text-sm">
                                        Vérifiez votre boîte mail pour le lien
                                        de réinitialisation.
                                    </p>
                                </div>
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
                            <h2 className="text-center text-xl font-semibold">
                                Mot de passe oublié ?
                            </h2>
                            <p className="text-center text-sm text-muted-foreground">
                                Entrez votre email pour recevoir un lien de
                                réinitialisation
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
                                        Envoyer le lien
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
