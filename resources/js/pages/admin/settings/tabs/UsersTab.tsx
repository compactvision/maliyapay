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
import { useForm } from '@inertiajs/react'; // No router needed if we use simple requests, but for role assignment we might
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface UserFormData {
    roles: string[];
}

export function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get(route('admin.users.index'), {
                params: { page, search },
            });
            // ... (rest of logic)
            // Actually I should probably fix the fetchUsers as well if I change types
            const response = await axios.get('/admin/users?format=json');
            setUsers(response.data.data);
        } catch (err) {
            console.error('Failed to fetch users');
        }
    };

    const fetchRoles = async () => {
        const res = await axios.get(route('roles.index'));
        setRoles(res.data);
    };

    useEffect(() => {
        fetchRoles();
        // fetchUsers(); // Need to fix controller first.
    }, []);

    // Quick fix: UserManagementController.php - I need to make sure it can return JSON.

    return (
        <Card>
            <CardHeader>
                <CardTitle>Utilisateurs & Rôles</CardTitle>
                <CardDescription>
                    Attribuer des rôles aux utilisateurs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Rechercher (email, nom)..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={fetchUsers}>Rechercher</Button>
                </div>

                <div className="space-y-2">
                    {users.length === 0 && (
                        <p className="py-4 text-center text-gray-500">
                            Cliquez sur rechercher ou aucun résultat.
                        </p>
                    )}
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between rounded border p-3"
                        >
                            <div>
                                <div className="font-bold">{user.name}</div>
                                <div className="text-sm text-gray-500">
                                    {user.email}
                                </div>
                                <div className="mt-1 text-xs">
                                    {user.roles.map((r: Role) => (
                                        <span
                                            key={r.id}
                                            className="mr-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                                        >
                                            {r.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <UserRoleDialog
                                user={user}
                                roles={roles}
                                onSuccess={fetchUsers}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function UserRoleDialog({
    user,
    roles,
    onSuccess,
}: {
    user: User;
    roles: Role[];
    onSuccess: () => void;
}) {
    const { data, setData, post, processing } = useForm<UserFormData>({
        roles: user.roles.map((r: Role) => r.name),
    });
    const [open, setOpen] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.assign_role', user.id), {
            onSuccess: () => {
                setOpen(false);
                onSuccess();
            },
        });
    };

    const toggleRole = (roleName: string) => {
        const currentRoles = data.roles;
        if (currentRoles.includes(roleName)) {
            setData(
                'roles',
                currentRoles.filter((r: string) => r !== roleName),
            );
        } else {
            setData('roles', [...currentRoles, roleName]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Gérer rôles
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rôles pour {user.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`ur-${role.id}`}
                                    checked={data.roles.includes(role.name)}
                                    onCheckedChange={() =>
                                        toggleRole(role.name)
                                    }
                                />
                                <label
                                    htmlFor={`ur-${role.id}`}
                                    className="cursor-pointer text-sm"
                                >
                                    {role.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Sauvegarder
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
