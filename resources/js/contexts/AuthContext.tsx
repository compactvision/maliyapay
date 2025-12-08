/**
 * AuthContext - Global Authentication State Management
 *
 * Provides centralized authentication state to eliminate redundant API calls
 * and loading screens across page navigations.
 */

import { authApi } from '@/api/authApi';
import type { LoginCredentials, RegisterData, User } from '@/types/auth';
import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check authentication status on mount - ONLY ONCE
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
    }, []); // Empty dependency array = runs only once

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

    const value: AuthContextValue = {
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
