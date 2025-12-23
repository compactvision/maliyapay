import { useAuth } from '@/hooks/useAuth';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { SplashScreen } from '../ui/splash-screen';

interface GuestGuardProps {
    children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
    const { isAuthenticated, isLoading, isLocked } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated && !isLocked) {
            router.get('/'); // Use router.get
        }
    }, [isAuthenticated, isLoading, isLocked]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
