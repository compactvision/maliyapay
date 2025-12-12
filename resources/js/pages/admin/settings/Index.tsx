import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { GeneralTab } from './tabs/GeneralTab';
import { MaintenanceTab } from './tabs/MaintenanceTab';
import { PermissionsTab } from './tabs/PermissionsTab';
import { RolesTab } from './tabs/RolesTab';
import { StatsTab } from './tabs/StatsTab';
import { UsersTab } from './tabs/UsersTab';

interface Props {
    settings: any;
    stats: any;
}

export default function MaliyaSettings({ settings, stats }: Props) {
    return (
        <AppLayout>
            <Head title="MaliyaSettings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        MaliyaSettings
                    </h1>
                    <p className="text-muted-foreground">
                        Gestion centralisée des paramètres et des accès de
                        l'application.
                    </p>
                </div>

                <Tabs defaultValue="stats" className="space-y-4">
                    <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="stats"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Statistiques
                        </TabsTrigger>
                        <TabsTrigger
                            value="general"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Général
                        </TabsTrigger>
                        <TabsTrigger
                            value="maintenance"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Maintenance
                        </TabsTrigger>
                        <TabsTrigger
                            value="roles"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Rôles
                        </TabsTrigger>
                        <TabsTrigger
                            value="permissions"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Permissions
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="border bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow"
                        >
                            Utilisateurs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="space-y-4">
                        <StatsTab stats={stats} />
                    </TabsContent>

                    <TabsContent value="general">
                        <GeneralTab settings={settings} />
                    </TabsContent>

                    <TabsContent value="maintenance">
                        <MaintenanceTab settings={settings} />
                    </TabsContent>

                    <TabsContent value="roles">
                        <RolesTab />
                    </TabsContent>

                    <TabsContent value="permissions">
                        <PermissionsTab />
                    </TabsContent>

                    <TabsContent value="users">
                        <UsersTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
