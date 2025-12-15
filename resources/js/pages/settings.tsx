import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
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
    });

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
                                        (window.location.href =
                                            route('user-password.edit'))
                                    }
                                >
                                    Mettre à jour
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
