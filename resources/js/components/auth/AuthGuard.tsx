/**
 * AuthGuard Component
 *
 * Protects routes by checking authentication status
 * Redirects to login if not authenticated
 */

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { SplashScreen } from '../ui/splash-screen';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
