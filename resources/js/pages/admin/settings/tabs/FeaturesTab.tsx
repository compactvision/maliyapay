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
import { useForm } from '@inertiajs/react';
import React from 'react';

interface FeaturesTabProps {
    settings: any;
}

const APP_FEATURES = [
    {
        id: 'dashboard',
        label: 'Tableau de bord',
        description: 'Accès au tableau de bord principal',
    },
    {
        id: 'transactions',
        label: 'Transactions',
        description: 'Gestion des transactions financières',
    },
    {
        id: 'accounts',
        label: 'Comptes',
        description: 'Gestion des comptes bancaires et portefeuilles',
    },
    {
        id: 'categories',
        label: 'Catégories',
        description: 'Gestion des catégories de transactions',
    },
    {
        id: 'budgets',
        label: 'Budgets',
        description: 'Planification et suivi budgétaire',
    },
    {
        id: 'statistics',
        label: 'Statistiques',
        description: 'Analyses et rapports graphiques',
    },
    {
        id: 'tasks',
        label: 'Tâches',
        description: 'Gestion des listes de tâches',
    },
    {
        id: 'routines',
        label: 'Routine',
        description: 'Suivi des routines quotidiennes',
    },
    {
        id: 'performance',
        label: 'Performance',
        description: 'Suivi de la performance et des habitudes',
    },
];

export function FeaturesTab({ settings }: FeaturesTabProps) {
    const initialState = APP_FEATURES.reduce(
        (acc, feature) => {
            acc[`feature_${feature.id}`] =
                settings[`feature_${feature.id}`] === '1' ||
                settings[`feature_${feature.id}`] === undefined;
            return acc;
        },
        {} as Record<string, boolean>,
    );

    const { data, setData, post, processing } = useForm(initialState);

    const handleToggle = (id: string, checked: boolean) => {
        setData(`feature_${id}` as any, checked);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Fonctionnalités</CardTitle>
                <CardDescription>
                    Activez ou désactivez les modules de l'application. Les
                    modules désactivés afficheront une page de maintenance aux
                    utilisateurs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {APP_FEATURES.map((feature) => (
                            <div
                                key={feature.id}
                                className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm"
                            >
                                <div className="space-y-0.5">
                                    <Label className="text-base">
                                        {feature.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                                <Switch
                                    checked={data[`feature_${feature.id}`]}
                                    onCheckedChange={(checked) =>
                                        handleToggle(feature.id, checked)
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Sauvegarder les modifications
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
