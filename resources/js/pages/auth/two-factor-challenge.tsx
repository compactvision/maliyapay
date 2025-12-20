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
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Loader2, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';

export default function TwoFactorChallenge() {
    const { loginTwoFactor } = useAuth();
    const [recovery, setRecovery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [data, setData] = useState({
        code: '',
        recovery_code: '',
    });

    const toggleRecovery = () => {
        setRecovery(!recovery);
        setData({
            code: '',
            recovery_code: '',
        });
        setFormErrors({});
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});

        try {
            await loginTwoFactor(data);
            window.location.href = '/';
        } catch (err: any) {
            setFormErrors({
                [recovery ? 'recovery_code' : 'code']:
                    err.message || 'Code invalide',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Défi Double Authentification" />

            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">
                            Double Authentification
                        </CardTitle>
                        <CardDescription>
                            {recovery
                                ? "Veuillez confirmer l'accès à votre compte en saisissant l'un de vos codes de secours."
                                : "Veuillez confirmer l'accès à votre compte en saisissant le code d'authentification fourni par votre application."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {!recovery ? (
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        inputMode="numeric"
                                        name="code"
                                        value={data.code}
                                        className={
                                            formErrors.code
                                                ? 'border-red-500'
                                                : ''
                                        }
                                        autoFocus
                                        autoComplete="one-time-code"
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                code: e.target.value,
                                            })
                                        }
                                    />
                                    {formErrors.code && (
                                        <p className="text-sm font-medium text-red-500">
                                            {formErrors.code}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="recovery_code">
                                        Code de secours
                                    </Label>
                                    <Input
                                        id="recovery_code"
                                        type="text"
                                        name="recovery_code"
                                        value={data.recovery_code}
                                        className={
                                            formErrors.recovery_code
                                                ? 'border-red-500'
                                                : ''
                                        }
                                        autoFocus
                                        autoComplete="one-time-code"
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                recovery_code: e.target.value,
                                            })
                                        }
                                    />
                                    {formErrors.recovery_code && (
                                        <p className="text-sm font-medium text-red-500">
                                            {formErrors.recovery_code}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <Button disabled={isLoading} type="submit">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Vérification...
                                        </>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </Button>

                                <button
                                    type="button"
                                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                                    onClick={toggleRecovery}
                                >
                                    {recovery
                                        ? "Utiliser un code d'authentification"
                                        : 'Utiliser un code de secours'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
