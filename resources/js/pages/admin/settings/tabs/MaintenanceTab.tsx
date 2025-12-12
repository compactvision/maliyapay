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

interface MaintenanceTabProps {
    settings: any;
}

export function MaintenanceTab({ settings }: MaintenanceTabProps) {
    const { data, setData, post, processing } = useForm({
        maintenance_mode: settings.maintenance_mode === '1',
    });

    const handleChange = (checked: boolean) => {
        setData('maintenance_mode', checked);
        // We can trigger save immediately or use a button. Immediate is often nicer for switches but risky.
        // Let's us a save button or better, just useEffect?
        // User asked for "update and save". Let's use a button for safety or auto-save.
        // Given it's a critical setting, auto-save might be dangerous if misclicked.
        // But requested "Page doit permettre de modifier et sauvegarder".
        // Let's actually just update state, and have a save button, OR make the Switch trigger a modal?
        // Let's stick to standard form submission for simplicity.
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                    Mode Maintenance
                </CardTitle>
                <CardDescription>
                    Activez ce mode pour empêcher les utilisateurs d'accéder à
                    l'application. Seuls les administrateurs pourront y accéder.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="flex items-center space-x-4">
                    <Switch
                        id="maintenance_mode"
                        checked={data.maintenance_mode}
                        onCheckedChange={handleChange}
                    />
                    <Label htmlFor="maintenance_mode">
                        {data.maintenance_mode
                            ? 'Maintenance ACTIVÉE'
                            : 'Maintenance DÉSACTIVÉE'}
                    </Label>

                    <div className="ml-auto">
                        <button
                            type="submit"
                            className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                            disabled={processing}
                        >
                            Appliquer
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
