/**
 * AuthGuard Component
 *
 * Protects routes by checking authentication status
 * Redirects to login if not authenticated
 * Redirects to verify-email if email is not verified
 */

import { useAuth } from '@/hooks/useAuth';
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
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            window.location.href = '/login';
        } else if (
            !isLoading &&
            isAuthenticated &&
            requireEmailVerification &&
            user &&
            !user.email_verified_at &&
            window.location.pathname !== '/verify-email'
        ) {
            window.location.href = '/verify-email';
        }
    }, [isAuthenticated, isLoading, user, requireEmailVerification]);

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
        window.location.pathname !== '/verify-email'
    ) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
