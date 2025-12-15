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
import { useForm } from '@inertiajs/react';
import React from 'react';

interface GeneralTabProps {
    settings: any;
}

export function GeneralTab({ settings }: GeneralTabProps) {
    const { data, setData, post, processing, hasErrors, errors } = useForm<{
        app_name: string;
        app_desc: string;
        app_url: string;
        logo: File | null;
    }>({
        app_name: settings.app_name || '',
        app_desc: settings.app_desc || '',
        app_url: settings.app_url || '',
        logo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
                <CardDescription>
                    Configuration de base de l'application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="app_name">Nom de l'application</Label>
                        <Input
                            id="app_name"
                            value={data.app_name}
                            onChange={(e) =>
                                setData('app_name', e.target.value)
                            }
                        />
                        {errors.app_name && (
                            <p className="text-sm text-red-500">
                                {errors.app_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="app_desc">Description</Label>
                        <Input
                            id="app_desc"
                            value={data.app_desc}
                            onChange={(e) =>
                                setData('app_desc', e.target.value)
                            }
                        />
                        {errors.app_desc && (
                            <p className="text-sm text-red-500">
                                {errors.app_desc}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo</Label>
                        {settings.app_logo && (
                            <div className="mb-2">
                                <img
                                    src={settings.app_logo}
                                    alt="Logo actuel"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                        )}
                        <Input
                            id="logo"
                            type="file"
                            onChange={(e) =>
                                setData(
                                    'logo',
                                    e.target.files ? e.target.files[0] : null,
                                )
                            }
                            accept="image/*"
                        />
                        {errors.logo && (
                            <p className="text-sm text-red-500">
                                {errors.logo}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Sauvegarder
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
