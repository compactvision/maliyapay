import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function RolesTab() {
    const [roles, setRoles] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);

    // Fetch data via generic API resource or passed props.
    // Since we didn't implement an API endpoint for fetching roles explicitly in the plan (we did resource routes),
    // let's assume we can fetch from the resource index.
    // Actually the Resource Controller 'index' returns raw JSON array, so axios.get('/admin/roles') works.

    const fetchRoles = async () => {
        try {
            const res = await axios.get(route('roles.index'));
            setRoles(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await axios.get(route('permissions.index'));
            setAllPermissions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr ?')) {
            router.delete(route('roles.destroy', id), {
                onSuccess: () => fetchRoles(),
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>Gestion des Rôles</CardTitle>
                    <CardDescription>
                        Créer et gérer les rôles utilisateurs.
                    </CardDescription>
                </div>
                <RoleDialog
                    onSuccess={fetchRoles}
                    allPermissions={allPermissions}
                />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex items-center justify-between rounded border p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <div>
                                <h4 className="font-semibold">{role.name}</h4>
                                <div className="text-xs text-gray-500">
                                    Permissions:{' '}
                                    {role.permissions
                                        ?.map((p: any) => p.name)
                                        .join(', ') || 'Aucune'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <RoleDialog
                                    role={role}
                                    onSuccess={fetchRoles}
                                    allPermissions={allPermissions}
                                    trigger={
                                        <Button variant="ghost" size="sm">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => handleDelete(role.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function RoleDialog({
    role,
    onSuccess,
    allPermissions,
    trigger,
}: {
    role?: any;
    onSuccess: () => void;
    allPermissions: any[];
    trigger?: React.ReactNode;
}) {
    const isEdit = !!role;
    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: role?.name || '',
        permissions: role?.permissions
            ? role.permissions.map((p: any) => p.name)
            : [],
    });
    const [open, setOpen] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const action = isEdit ? put : post;
        const url = isEdit
            ? route('roles.update', role.id)
            : route('roles.store');

        action(url, {
            onSuccess: () => {
                setOpen(false);
                reset();
                onSuccess();
            },
        });
    };

    const togglePermission = (permName: string) => {
        if (data.permissions.includes(permName)) {
            setData(
                'permissions',
                data.permissions.filter((p: string) => p !== permName),
            );
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Nouveau Rôle</Button>}
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Modifier le rôle' : 'Créer un rôle'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <label>Nom du rôle</label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label>Permissions associées</label>
                        <div className="grid grid-cols-2 gap-2 rounded border p-2">
                            {allPermissions.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`perm-${perm.id}`}
                                        checked={data.permissions.includes(
                                            perm.name,
                                        )}
                                        onCheckedChange={() =>
                                            togglePermission(perm.name)
                                        }
                                    />
                                    <label
                                        htmlFor={`perm-${perm.id}`}
                                        className="cursor-pointer text-sm"
                                    >
                                        {perm.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {isEdit ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
