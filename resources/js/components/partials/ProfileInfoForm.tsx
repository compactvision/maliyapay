// resources/js/pages/Profile/Partials/ProfileInfoForm.tsx

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
import { User } from '@/types/auth';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import React, { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface ProfileInfoFormProps {
    user: User | null;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
    const { refreshUser } = useAuth();
    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
            avatar: null as File | null,
            _method: 'PATCH',
        });

    if (!user) return null;

    React.useEffect(() => {
        if (user) {
            setData((prev) => ({
                ...prev,
                name: user.name,
                email: user.email,
            }));
        }
    }, [user]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            onSuccess: async () => {
                toast.success('Profil mis à jour avec succès !');
                setData('avatar', null);
                await refreshUser();
            },
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error('Profile update errors:', errors);
                toast.error('Erreur lors de la mise à jour');
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('avatar', e.target.files[0]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                    Mettez à jour vos informations de compte, votre adresse
                    e-mail et votre photo de profil.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={submit}
                    className="space-y-6"
                    encType="multipart/form-data"
                >
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-gray-100">
                            {data.avatar ? (
                                <img
                                    src={URL.createObjectURL(data.avatar)}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2 text-center sm:text-left">
                            <Label
                                htmlFor="avatar"
                                className="cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
                            >
                                Changer la photo
                            </Label>
                            <Input
                                id="avatar"
                                type="file"
                                className="hidden"
                                onChange={handleAvatarChange}
                                accept="image/*"
                            />
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG ou GIF (Max. 2MB)
                            </p>
                            {errors.avatar && (
                                <p className="text-sm text-destructive">
                                    {errors.avatar}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            className="h-11 text-base" // <-- CORRECTION
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className="h-11 text-base"
                            disabled
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-11 w-full sm:w-auto" // <-- AMÉLIORATION
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Enregistrer les modifications
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}