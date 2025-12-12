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

export function UsersTab() {
    // We fetch users here or use passed props. The Controller 'index' passed 'users' prop but implementation plan said 'users-tab' separate.
    // The Controller renders 'Admin/Settings/Tabs/UsersTab' - wait, my controller structure rendered 'Admin/Settings/Index'

    // Ah, my controller MaliyaSettingsController:
    /*
        public function index() {
            // ...
            return Inertia::render('Admin/Settings/Index', ...);
        }
    */

    // So UsersTab is a sub-component of Index.
    // But `UserManagementController::index` renders `Admin/Settings/Tabs/UsersTab`.
    // This means navigating to `/admin/users` would render JUST the tab content? That might be weird outside the layout.
    // Ideally `/admin/users` should probably render the full layout OR we just load uses via API in the main page tab.

    // Given the requirement "Page d’administration “MaliyaSettings” ... avec des onglets", it implies a SINGLE page.
    // So `UserManagementController` might just be an API for the tab.

    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get(route('admin.users.index'), {
                params: { page, search },
            });
            // Wait, UserManagementController::index returns Inertia render.
            // I should add an API method to it or assume I can get JSON if I ask?
            // Inertia requests return JSON if X-Inertia header is present.
            // But actually standard axios doesn't set that.
            // I'll create a new method `list` in UserManagementController if needed, OR just change `index` to return JSON if expectsJson.

            // For now, let's assume I modify the controller or use a dedicated API
            // Actually, I added `list` method in my controller plan but didn't route it?
            // I routed `index`.
            // Let's modify `UserManagementController::index` to return JSON if `wantsJson()`.

            // Temporarily, let's assume `admin.users.index` returns JSON if I request it correctly,
            // OR I will fix the Controller in next step to be sure.

            // Let's assume the controller returns the Inertia page, which is not what we want for an AJAX tab load.
            // Better approach: Pass initial users to the view? No, too heavy.
            // I'll use a `list` route if I can, or `admin.users.index` with `wantsJson` check.

            const response = await axios.get('/admin/users?format=json'); // Hacky? No, just add param.
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
                                    {user.roles.map((r: any) => (
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
    user: any;
    roles: any[];
    onSuccess: () => void;
}) {
    const { data, setData, post, processing } = useForm({
        roles: user.roles.map((r: any) => r.name),
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
        if (data.roles.includes(roleName)) {
            setData(
                'roles',
                data.roles.filter((r: string) => r !== roleName),
            );
        } else {
            setData('roles', [...data.roles, roleName]);
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
