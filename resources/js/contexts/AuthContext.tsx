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
    useMemo,
    useState,
    type ReactNode,
} from 'react';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<any>;
    loginTwoFactor: (data: {
        code?: string;
        recovery_code?: string;
    }) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => Promise<void>;
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

    const login = async (credentials: LoginCredentials): Promise<any> => {
        try {
            setError(null);
            const response = await authApi.login(credentials);

            if (response.two_factor) {
                return response;
            }

            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const loginTwoFactor = async (data: {
        code?: string;
        recovery_code?: string;
    }): Promise<void> => {
        try {
            setError(null);
            const response = await authApi.loginTwoFactor(data);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Code invalide';
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

    const sendVerificationEmail = async (): Promise<void> => {
        try {
            await authApi.sendVerificationEmail();
        } catch (err) {
            throw new Error(
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l'envoi de l'email",
            );
        }
    };

    const forgotPassword = async (email: string): Promise<void> => {
        try {
            await authApi.forgotPassword({ email });
        } catch (err) {
            throw new Error(
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la demande',
            );
        }
    };

    const resetPassword = async (data: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> => {
        try {
            await authApi.resetPassword(data);
        } catch (err) {
            throw new Error(
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la réinitialisation',
            );
        }
    };

    const value: AuthContextValue = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated,
            error,
            login,
            loginTwoFactor,
            register,
            logout,
            refreshUser,
            sendVerificationEmail,
            forgotPassword,
            resetPassword,
        }),
        [
            user,
            isLoading,
            isAuthenticated,
            error,
            login,
            loginTwoFactor,
            register,
            logout,
            refreshUser,
            sendVerificationEmail,
            forgotPassword,
            resetPassword,
        ],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
