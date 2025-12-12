import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Shield, UserCheck, Users } from 'lucide-react';

interface StatsTabProps {
    stats: {
        users_count: number;
        admins_count: number;
        roles_count: number;
        permissions_count: number;
    };
}

export function StatsTab({ stats }: StatsTabProps) {
    const items = [
        {
            label: 'Utilisateurs Total',
            value: stats.users_count,
            icon: Users,
            color: 'text-blue-500',
        },
        {
            label: 'Administrateurs',
            value: stats.admins_count,
            icon: Shield,
            color: 'text-red-500',
        },
        {
            label: 'Rôles Définis',
            value: stats.roles_count,
            icon: UserCheck,
            color: 'text-green-500',
        },
        {
            label: 'Permissions',
            value: stats.permissions_count,
            icon: Key,
            color: 'text-yellow-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.label}
                        </CardTitle>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
