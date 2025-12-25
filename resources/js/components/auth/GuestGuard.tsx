import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { SplashScreen } from '../ui/splash-screen';
import { usePage, router } from '@inertiajs/react';
import React from 'react';

interface GuestGuardProps {
    children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
    const { isLoading } = useAuth();
    const { props } = usePage();
    const auth = props.auth as any; // Cast to any or appropriate type if available

    useEffect(() => {
        // Only redirect if the SERVER thinks we are authenticated
        if (auth?.user) {
            router.get('/');
        }
    }, [auth?.user]);

    if (isLoading) {
        return <SplashScreen />;
    }

    // If server says we have a user, don't render children (we are redirecting)
    if (auth?.user) {
        return null;
    }

    return <>{children}</>;
}
