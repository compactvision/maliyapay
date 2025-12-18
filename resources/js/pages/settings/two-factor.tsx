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
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    Copy,
    Key,
    Loader2,
    QrCode,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    twoFactorEnabled: boolean;
    isConfirming: boolean;
    requiresConfirmation: boolean;
}

export default function TwoFactor({
    twoFactorEnabled,
    isConfirming,
    requiresConfirmation,
}: Props) {
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    const confirmationForm = useForm({
        code: '',
    });

    useEffect(() => {
        if (isConfirming) {
            showQrCode();
            showRecovery();
        }
    }, [isConfirming]);

    // Get QR Code
    const showQrCode = () => {
        return axios.get('/user/two-factor-qr-code').then((response) => {
            setQrCode(response.data.svg);
        });
    };

    // Get Recovery Codes
    const showRecovery = () => {
        return axios.get('/user/two-factor-recovery-codes').then((response) => {
            setRecoveryCodes(response.data);
        });
    };

    // Enable 2FA
    const enableTwoFactorAuthentication = () => {
        setEnabling(true);

        router.post(
            route('two-factor.enable'),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    Promise.all([showQrCode(), showRecovery()]).finally(() =>
                        setEnabling(false),
                    ),
                onError: (errors) => {
                    setEnabling(false);
                    toast.error(
                        "Impossible d'activer la double authentification",
                    );
                    console.error('2FA Enable Error:', errors);
                },
            },
        );
    };

    // Confirm 2FA
    const confirmTwoFactorAuthentication = (e: React.FormEvent) => {
        e.preventDefault();

        confirmationForm.post('/user/confirmed-two-factor-authentication', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setQrCode(null);
                setShowRecoveryCodes(true);
                toast.success('Double authentification activée avec succès');
            },
            onError: (errors) => {
                toast.error('Code de confirmation invalide');
                console.error('2FA Confirm Error:', errors);
            },
        });
    };

    // Regenerate Recovery Codes
    const regenerateRecoveryCodes = () => {
        setRegenerating(true);
        router.post(
            '/user/two-factor-recovery-codes',
            {},
            {
                onSuccess: () =>
                    showRecovery().finally(() => setRegenerating(false)),
                onError: () => {
                    setRegenerating(false);
                    toast.error('Erreur lors de la régénération des codes');
                },
            },
        );
    };

    // Disable 2FA
    const disableTwoFactorAuthentication = () => {
        setDisabling(true);

        router.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setDisabling(false);
                setQrCode(null);
                setRecoveryCodes([]);
                toast.success('Double authentification désactivée');
            },
            onError: (errors) => {
                setDisabling(false);
                toast.error(
                    'Impossible de désactiver la double authentification',
                );
                console.error('2FA Disable Error:', errors);
            },
        });
    };

    // Load codes if enabled and not currently confirming
    useEffect(() => {
        if (twoFactorEnabled && !requiresConfirmation) {
            showRecovery();
        }
    }, [twoFactorEnabled]);

    return (
        <AppLayout>
            <Head title="Double Authentification" />

            <div className="mx-auto max-w-4xl py-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Double Authentification (2FA)
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ajoutez une couche de sécurité supplémentaire à
                            votre compte.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut</CardTitle>
                            <CardDescription>
                                {twoFactorEnabled
                                    ? 'Vous avez activé la double authentification.'
                                    : "Vous n'avez pas encore activé la double authentification."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-4">
                                    {twoFactorEnabled ? (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                            <ShieldAlert className="h-6 w-6" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">
                                            {twoFactorEnabled
                                                ? 'Activée'
                                                : 'Désactivée'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {twoFactorEnabled
                                                ? 'Votre compte est mieux protégé.'
                                                : "Nous vous recommandons de l'activer."}
                                        </p>
                                    </div>
                                </div>

                                {!twoFactorEnabled ? (
                                    <Button
                                        onClick={enableTwoFactorAuthentication}
                                        disabled={enabling}
                                    >
                                        {enabling && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Activer
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        onClick={disableTwoFactorAuthentication}
                                        disabled={disabling}
                                    >
                                        {disabling && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Désactiver
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code Section (When enabling) */}
                    {qrCode && (
                        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Configuration</CardTitle>
                                </div>
                                <CardDescription>
                                    Scannez ce QR code avec votre application
                                    d'authentification (Google Authenticator,
                                    Authy, Microsoft Authenticator).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6 pt-4">
                                <div
                                    className="rounded-lg bg-white p-4 shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />

                                {requiresConfirmation && (
                                    <form
                                        onSubmit={
                                            confirmTwoFactorAuthentication
                                        }
                                        className="w-full max-w-xs space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="code">
                                                Code de confirmation
                                            </Label>
                                            <Input
                                                id="code"
                                                type="text"
                                                placeholder="000000"
                                                value={
                                                    confirmationForm.data.code
                                                }
                                                onChange={(e) =>
                                                    confirmationForm.setData(
                                                        'code',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    confirmationForm.errors.code
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {confirmationForm.errors.code && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        confirmationForm.errors
                                                            .code
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={
                                                confirmationForm.processing
                                            }
                                        >
                                            {confirmationForm.processing && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Confirmer l'activation
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recovery Codes Section */}
                    {twoFactorEnabled &&
                        (requiresConfirmation ? showRecoveryCodes : true) &&
                        recoveryCodes.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-emerald-600" />
                                        <CardTitle>Codes de secours</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Conservez ces codes dans un endroit sûr.
                                        Ils vous permettront d'accéder à votre
                                        compte si vous perdez votre téléphone.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-4 font-mono text-sm dark:bg-slate-800">
                                        {recoveryCodes.map((code) => (
                                            <div key={code} className="p-1">
                                                {code}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    recoveryCodes.join('\n'),
                                                );
                                                toast.success('Codes copiés');
                                            }}
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copier
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={regenerateRecoveryCodes}
                                            disabled={regenerating}
                                        >
                                            <RefreshCw
                                                className={`mr-2 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`}
                                            />
                                            Régénérer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                </div>
            </div>
        </AppLayout>
    );
}
