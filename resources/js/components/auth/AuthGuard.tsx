import { useAuth } from '@/hooks/useAuth';
import { router } from '@inertiajs/react'; // Added import
import { useEffect } from 'react';
import { SplashScreen } from '../ui/splash-screen';

interface AuthGuardProps {
    children: React.ReactNode;
    requireEmailVerification?: boolean;
}

export function AuthGuard({
    children,
    requireEmailVerification = true,
}: AuthGuardProps) {
    const { isAuthenticated, isLoading, user, isLocked } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isLocked) {
            router.get('/login'); // Use router.get for login redirect
        } else if (
            !isLoading &&
            isAuthenticated &&
            !isLocked &&
            requireEmailVerification &&
            user &&
            !user.email_verified_at &&
            window.location.pathname !== '/verify-email' &&
            !window.location.search.includes('onboarding=true')
        ) {
            router.get('/verify-email'); // Use router.get
        }
    }, [isAuthenticated, isLoading, user, isLocked, requireEmailVerification]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    if (
        requireEmailVerification &&
        user &&
        !user.email_verified_at &&
        window.location.pathname !== '/verify-email' &&
        !window.location.search.includes('onboarding=true')
    ) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
