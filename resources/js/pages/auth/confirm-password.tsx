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
import { Loader2, Lock } from 'lucide-react';
import React from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AppLayout>
            <Head title="Confirmer le mot de passe" />

            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Lock className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">
                            Zone sécurisée
                        </CardTitle>
                        <CardDescription>
                            Veuillez confirmer votre mot de passe avant de
                            continuer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={
                                        errors.password ? 'border-red-500' : ''
                                    }
                                    autoFocus
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <Button
                                className="w-full"
                                disabled={processing}
                                type="submit"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Confirmation...
                                    </>
                                ) : (
                                    'Confirmer'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
