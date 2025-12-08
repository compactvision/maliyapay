/**
 * GuestGuard Component
 *
 * Redirects authenticated users away from auth pages
 */

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

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
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
