// resources/js/pages/Profile/Partials/ProfileHeader.tsx

// 1. Importez `AvatarImage` en plus de `Avatar` et `AvatarFallback`
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types'; // Assurez-vous que le type User a une propriété `avatar`

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
                        {/* 
                          2. Ajoutez le composant AvatarImage.
                          Le composant Avatar affichera cette image.
                          Si `user.avatar` est null, vide ou si l'image ne charge pas,
                          il affichera automatiquement le contenu de `AvatarFallback`.
                        */}
                        <AvatarImage 
                            src={user.avatar || undefined} 
                            alt={`Avatar de ${user.name}`} 
                        />
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