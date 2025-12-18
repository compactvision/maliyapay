import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Bell, Languages, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    language: string;
    two_factor_enabled?: boolean;
    receive_notifications: boolean | number; // Laravel DB might return 0/1 or false/true
}

interface PageProps {
    user: User;
    status: string | null;
}

export default function Settings({ user }: PageProps) {
    const { props } = usePage();

    // Conversion sûre du booléen/entier
    const initialNotificationState =
        user.receive_notifications === true || user.receive_notifications === 1;

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        receive_notifications: initialNotificationState,
        language: user.language || 'fr',
    });

    const handleLanguageChange = (value: string) => {
        setData('language', value);

        router.patch(
            route('settings.language.update'),
            {
                language: value,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Langue mise à jour');
                },
                onError: () => {
                    toast.error('Erreur lors de la mise à jour de la langue');
                    setData('language', data.language);
                },
            },
        );
    };

    const handleNotificationChange = (checked: boolean) => {
        setData('receive_notifications', checked);

        // Use router.patch via the form helper manually or Inertia router
        // Since useForm's patch sends 'data', which is stale here.
        // We can pass data to processing options? No.
        // Best approach: Use router.visit or just manually update before sending?
        // Actually, let's use the transform prop of useForm temporarily? No.

        // Simple fix: router.patch specific payload
        router.patch(
            route('settings.notifications.update'),
            {
                receive_notifications: checked,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        checked
                            ? 'Notifications activées'
                            : 'Notifications désactivées',
                    );
                },
                onError: () => {
                    toast.error(
                        'Erreur lors de la mise à jour des préférences',
                    );
                    setData('receive_notifications', !checked);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Paramètres" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Paramètres
                    </h2>
                    <p className="text-muted-foreground">
                        Gérez vos préférences de compte et de notifications.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Section Notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                <CardTitle>Notifications</CardTitle>
                            </div>
                            <CardDescription>
                                Configurez comment et quand vous souhaitez être
                                notifié.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Activer les notifications
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Recevoir des alertes pour les tâches en
                                        retard, les tâches du jour et les
                                        avertissements budgétaires.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.receive_notifications}
                                    onCheckedChange={handleNotificationChange}
                                    disabled={processing}
                                />
                            </div>
                            {/* On pourrait ajouter d'autres options ici (email, sons, etc.) dans le futur */}
                        </CardContent>
                    </Card>

                    {/* Section Sécurité (Exemple) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Languages className="h-5 w-5 text-purple-500" />
                                <CardTitle>Langue (Language)</CardTitle>
                            </div>
                            <CardDescription>
                                Choisissez la langue d'affichage de
                                l'application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Langue préférée
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Basculer entre le Français et l'Anglais.
                                    </p>
                                </div>
                                <Select
                                    value={data.language}
                                    onValueChange={handleLanguageChange}
                                    disabled={processing}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Choisir une langue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fr">
                                            Français
                                        </SelectItem>
                                        <SelectItem value="en">
                                            English
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section Sécurité (Exemple) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                <CardTitle>Sécurité</CardTitle>
                            </div>
                            <CardDescription>
                                Gérez votre mot de passe et l'authentification à
                                deux facteurs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Mot de passe
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Modifiez votre mot de passe pour
                                        sécuriser votre compte.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            route('user-password.edit'),
                                        )
                                    }
                                >
                                    Mettre à jour
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">
                                        Double Authentification
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground">
                                            Sécurisez votre compte avec un
                                            deuxième facteur.
                                        </p>
                                        {user.two_factor_enabled && (
                                            <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(route('two-factor.show'))
                                    }
                                >
                                    Gérer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
