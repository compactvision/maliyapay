// resources/js/pages/Profile/Partials/PasswordChangeForm.tsx

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
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function PasswordChangeForm() {
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        symbol: false,
        match: false,
    });

    useEffect(() => {
        setRequirements({
            length: data.password.length >= 6,
            upper: /[A-Z]/.test(data.password),
            lower: /[a-z]/.test(data.password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
            match:
                data.password.length > 0 &&
                data.password === data.password_confirmation,
        });
    }, [data.password, data.password_confirmation]);

    const isPasswordValid =
        requirements.length &&
        requirements.upper &&
        requirements.lower &&
        requirements.symbol &&
        requirements.match;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error(
                'Veuillez respecter tous les critères de sécurité du mot de passe.',
            );
            return;
        }

        patch(route('profile.password.update'), {
            onSuccess: () => {
                toast.success('Mot de passe mis à jour avec succès !');
                reset();
            },
            onError: (errors) => {
                if (errors.current_password) {
                    toast.error(errors.current_password);
                } else {
                    toast.error(
                        'Erreur lors de la mise à jour du mot de passe.',
                    );
                }
            },
        });
    };

    const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
        switch (field) {
            case 'current':
                setShowCurrentPassword(!showCurrentPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mettre à jour le mot de passe</CardTitle>
                <CardDescription>
                    Assurez-vous que votre compte utilise un mot de passe long
                    et aléatoire pour rester en sécurité.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">
                            Mot de passe actuel
                        </Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                                required
                                autoComplete="current-password"
                                className="h-11 pr-10 text-base"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleVisibility('current')}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.current_password && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showNewPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                autoComplete="new-password"
                                className="h-11 pr-10 text-base"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleVisibility('new')}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {/* Password Requirements List */}
                        <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm dark:bg-muted/30">
                            <p className="font-medium text-muted-foreground">
                                Critères de sécurité :
                            </p>
                            <ul className="space-y-1">
                                <RequirementItem
                                    met={requirements.length}
                                    text="Au moins 6 caractères"
                                />
                                <RequirementItem
                                    met={requirements.upper}
                                    text="Une majuscule"
                                />
                                <RequirementItem
                                    met={requirements.lower}
                                    text="Une minuscule"
                                />
                                <RequirementItem
                                    met={requirements.symbol}
                                    text="Un symbole (!@#$%...)"
                                />
                            </ul>
                        </div>
                        {errors.password && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                required
                                autoComplete="new-password"
                                className="h-11 pr-10 text-base"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleVisibility('confirm')}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {!requirements.match &&
                            data.password_confirmation.length > 0 && (
                                <p className="flex items-center text-sm font-medium text-destructive">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Les mots de passe ne correspondent pas
                                </p>
                            )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !isPasswordValid}
                        className="h-11 w-full sm:w-auto" 
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Enregistrer le mot de passe
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <li
            className={cn(
                'flex items-center gap-2 transition-colors duration-200',
                met ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground',
            )}
        >
            {met ? (
                <Check className="h-4 w-4" />
            ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
            <span className={met ? 'line-through opacity-80' : ''}>{text}</span>
        </li>
    );
}