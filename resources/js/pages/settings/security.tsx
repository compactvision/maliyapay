import { PinPad } from '@/components/auth/PinPad';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Shield, Smartphone } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Security() {
    const { user, setupPin, toggleAutoLock } = useAuth();
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'password' | 'pin'>('password');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleAutoLock = async (checked: boolean) => {
        if (checked && !user?.auto_lock_enabled && !user?.pin_code_set) {
            // User wants to enable but hasn't set a PIN yet
            setIsPinModalOpen(true);
            return;
        }

        try {
            await toggleAutoLock(checked);
            toast.success(
                checked
                    ? 'Verrouillage automatique activé'
                    : 'Verrouillage automatique désactivé',
            );
        } catch (err) {
            toast.error('Une erreur est survenue');
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) {
            setStep('pin');
        }
    };

    const handlePinComplete = async (pin: string) => {
        setIsLoading(true);
        try {
            await setupPin({ pin_code: pin, password });
            toast.success('Code PIN configuré avec succès');
            setIsPinModalOpen(false);
            setPassword('');
            setStep('password');
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la configuration',
            );
            if (err instanceof Error && err.message.includes('mot de passe')) {
                setStep('password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Sécurité de l'application" />

            <div className="mx-auto max-w-2xl py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.visit(route('settings.index'))
                            }
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Sécurité
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Protégez l'accès à vos données financières.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Protection de l'application */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-500" />
                                <CardTitle>
                                    Verrouillage de l'application
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Exiger un code PIN lorsque la session expire ou
                                après une période d'inactivité.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Activer le verrouillage automatique
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Vérifier le code PIN pour reprendre la
                                        session sans reconnexion complète.
                                    </p>
                                </div>
                                <Switch
                                    checked={user?.auto_lock_enabled}
                                    onCheckedChange={handleToggleAutoLock}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Code PIN
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Utilisé pour déverrouiller l'application
                                        rapidement.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep('password');
                                        setIsPinModalOpen(true);
                                    }}
                                >
                                    {user?.auto_lock_enabled
                                        ? 'Changer le PIN'
                                        : 'Configurer un PIN'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Information Sécurité */}
                    <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <div className="flex gap-3">
                            <Shield className="h-5 w-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                    Conseil de sécurité
                                </p>
                                <p className="text-xs opacity-90">
                                    Le code PIN est stocké de manière sécurisée
                                    (haché) sur nos serveurs. Ne partagez jamais
                                    votre code PIN avec qui que ce soit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PIN Setup Modal */}
            <Dialog
                open={isPinModalOpen}
                onOpenChange={(open) => {
                    if (!isLoading) setIsPinModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {step === 'password'
                                ? 'Vérification de sécurité'
                                : 'Choisir un code PIN'}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 'password'
                                ? 'Veuillez entrer votre mot de passe pour continuer.'
                                : 'Entrez un code à 4 chiffres.'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'password' ? (
                        <form
                            onSubmit={handlePasswordSubmit}
                            className="space-y-4 py-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="verify-password">
                                    Mot de passe actuel
                                </Label>
                                <Input
                                    id="verify-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={!password}>
                                    Continuer
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center py-6">
                            <PinPad
                                onComplete={handlePinComplete}
                                isLoading={isLoading}
                            />
                            <Button
                                variant="ghost"
                                className="mt-4 text-xs"
                                onClick={() => setStep('password')}
                                disabled={isLoading}
                            >
                                Retour
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
