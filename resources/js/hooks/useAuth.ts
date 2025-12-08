/**
 * useAuth Hook
 *
 * Custom React hook for authentication with react-hook-form
 */

import { authApi } from '@/api/authApi';
import type { LoginCredentials, RegisterData, User } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
    remember: z.boolean().optional(),
});

const registerSchema = z
    .object({
        name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        email: z.string().email('Email invalide'),
        password: z
            .string()
            .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre',
            ),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['password_confirmation'],
    });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Hook for authentication state and operations
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (authApi.isAuthenticated()) {
                try {
                    const userData = await authApi.getUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (err) {
                    // Token invalid, clear it
                    localStorage.removeItem('auth_token');
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            setError(null);
            const response = await authApi.login(credentials);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (data: RegisterData): Promise<void> => {
        try {
            setError(null);
            const response = await authApi.register(data);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Erreur d'inscription";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            // Redirect to login page
            window.location.href = '/login';
        }
    };

    const refreshUser = useCallback(async () => {
        if (authApi.isAuthenticated()) {
            try {
                const userData = await authApi.getUser();
                setUser(userData);
            } catch (err) {
                console.error('Failed to refresh user:', err);
            }
        }
    }, []);

    return {
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        refreshUser,
    };
}

/**
 * Hook for login form
 */
export function useLoginForm(): UseFormReturn<LoginFormValues> {
    return useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });
}

/**
 * Hook for register form
 */
export function useRegisterForm(): UseFormReturn<RegisterFormValues> {
    return useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });
}
