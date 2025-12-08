/**
 * PageWrapper Component
 *
 * Automatically wraps pages with AuthGuard or GuestGuard based on requiresAuth prop
 */

import { AuthGuard } from '@/components/auth/AuthGuard';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { usePage } from '@inertiajs/react';

interface PageWrapperProps {
    children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
    const { props } = usePage<{ requiresAuth?: boolean }>();
    const requiresAuth = props.requiresAuth ?? true; // Default to requiring auth

    if (requiresAuth) {
        return <AuthGuard>{children}</AuthGuard>;
    }

    return <GuestGuard>{children}</GuestGuard>;
}
