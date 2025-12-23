// resources/js/pages/Profile/Partials/ProfileHeader.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types/auth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

    const formattedCreationDate = user.created_at
        ? format(new Date(user.created_at), 'MMMM yyyy', { locale: fr })
        : '...';

    return (
        <Card className="rounded border-none shadow-none sm:rounded-lg sm:border sm:shadow-sm">
            <CardContent className="px-4 py-6 sm:px-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage
                            src={user.avatar || undefined}
                            alt={`Avatar de ${user.name}`}
                        />
                        <AvatarFallback className="text-lg sm:text-xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <h2 className="truncate text-xl font-bold sm:text-2xl">
                            {user.name}
                        </h2>
                        <p className="text-sm break-words text-muted-foreground">
                            {user.email}
                        </p>
                        <p className="mt-1 text-xs text-emerald-500">
                            Sur Maliya depuis {formattedCreationDate}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
