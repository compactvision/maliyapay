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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function PermissionsTab() {
    const [permissions, setPermissions] = useState<any[]>([]);

    const fetchPermissions = async () => {
        try {
            const res = await axios.get(route('permissions.index'));
            setPermissions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette permission ?')) {
            router.delete(route('permissions.destroy', id), {
                onSuccess: () => fetchPermissions(),
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                        Définir les actions possibles dans le système.
                    </CardDescription>
                </div>
                <PermissionDialog onSuccess={fetchPermissions} />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((perm) => (
                        <div
                            key={perm.id}
                            className="flex items-center justify-between rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span className="font-mono text-sm">
                                {perm.name}
                            </span>
                            <div className="flex gap-2">
                                <PermissionDialog
                                    perm={perm}
                                    onSuccess={fetchPermissions}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500"
                                    onClick={() => handleDelete(perm.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function PermissionDialog({
    perm,
    onSuccess,
    trigger,
}: {
    perm?: any;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}) {
    const isEdit = !!perm;
    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: perm?.name || '',
    });
    const [open, setOpen] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const action = isEdit ? put : post;
        const url = isEdit
            ? route('permissions.update', perm.id)
            : route('permissions.store');

        action(url, {
            onSuccess: () => {
                setOpen(false);
                reset();
                onSuccess();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Nouvelle Permission</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Modifier Permission' : 'Ajouter Permission'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <label>Clé de permission</label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="ex: users.create"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
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
