/**
 * GuestGuard Component
 *
 * Redirects authenticated users away from auth pages
 */

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { SplashScreen } from '../ui/splash-screen';

interface GuestGuardProps {
    children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            window.location.href = '/';
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
