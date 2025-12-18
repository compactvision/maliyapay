import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

export default function Password() {
    const { data, setData, put, errors, processing, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Debugging errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Validation Errors:', errors);
        }
    }, [errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Mot de passe mis à jour avec succès');
            },
            onError: (errors) => {
                toast.error('Erreur lors de la mise à jour du mot de passe');
                console.error('Password Update Error:', errors);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Modifier le mot de passe" />

            <div className="mx-auto max-w-2xl py-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Mot de passe
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Assurez-vous que votre compte utilise un mot de
                            passe long et aléatoire pour rester en sécurité.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Changer de mot de passe</CardTitle>
                        <CardDescription>
                            Entrez votre mot de passe actuel ainsi que le
                            nouveau pour effectuer le changement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-sm font-medium">
                                            Veuillez corriger les erreurs
                                            suivantes :
                                        </p>
                                    </div>
                                    <ul className="mt-2 list-inside list-disc text-xs opacity-80">
                                        {Object.values(errors).map(
                                            (error, idx) => (
                                                <li key={idx}>{error}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Mot de passe actuel */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password">
                                    Mot de passe actuel
                                </Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        errors.current_password
                                            ? 'border-red-500 ring-offset-background focus-visible:ring-red-500'
                                            : ''
                                    }
                                    autoComplete="current-password"
                                />
                                {errors.current_password && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* Nouveau mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Nouveau mot de passe
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className={
                                        errors.password
                                            ? 'border-red-500 ring-offset-background focus-visible:ring-red-500'
                                            : ''
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirmation du nouveau mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmer le nouveau mot de passe
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        errors.password_confirmation
                                            ? 'border-red-500 ring-offset-background focus-visible:ring-red-500'
                                            : ''
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        'Enregistrer'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
