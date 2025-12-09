// resources/js/pages/Profile/Partials/ProfileHeader.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types';

interface ProfileHeaderProps {
    user: User | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
