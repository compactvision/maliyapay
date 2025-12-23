/**
 * AuthContext - Global Authentication State Management
 *
 * Provides centralized authentication state to eliminate redundant API calls
 * and loading screens across page navigations.
 */

import { api, authApi } from '@/api/authApi';
import { UnlockScreen } from '@/components/auth/UnlockScreen';
import type { LoginCredentials, RegisterData, User } from '@/types/auth';
import { router } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import {
    createContext,
    useCallback,
    useEffect,
    useLayoutEffect,
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
    setupPin: (data: { pin_code: string; password: string }) => Promise<void>;
    toggleAutoLock: (enabled: boolean) => Promise<void>;
    updateAutoLockTimeout: (timeout: number) => Promise<void>;
    unlockWithPin: (pin: string) => Promise<void>;
    isLocked: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);

interface AuthProviderProps {
    children: ReactNode;
    initialAuth?: {
        user: User | null;
    };
}

export function AuthProvider({ children, initialAuth }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(initialAuth?.user || null);
    const [isLoading, setIsLoading] = useState(!initialAuth?.user);
    const [isAuthenticated, setIsAuthenticated] = useState(!!initialAuth?.user);
    const [isLocked, setIsLocked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync state if navigation happens (standard Inertia behavior)
    useEffect(() => {
        const unbind = router.on('navigate', (event: any) => {
            const sharedAuth = event.detail?.page?.props?.auth;
            if (sharedAuth?.user) {
                setUser(sharedAuth.user);
                setIsAuthenticated(true);
                setIsLoading(false);
            } else if (sharedAuth && sharedAuth.user === null) {
                // Server explicitly says user is null
                setUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        });
        return unbind;
    }, []);

    // Check authentication status on mount if not already handled by initialAuth
    useEffect(() => {
        const checkAuth = async () => {
            // If already authenticated via initial auth, skip API call
            if (isAuthenticated) {
                setIsLoading(false);
                return;
            }

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
    }, []); // Run once on mount

    // Intercept 401 errors to trigger auto-lock
    useLayoutEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && user?.pin_code_set) {
                    setIsLocked(true);
                }
                return Promise.reject(error);
            },
        );

        return () => api.interceptors.response.eject(interceptor);
    }, [user]);

    // Inactivity Lock Timer
    useEffect(() => {
        if (!isAuthenticated || !user?.auto_lock_enabled || isLocked) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);

            const timeout = (user.auto_lock_timeout || 300) * 1000; // Default 5min

            timeoutId = setTimeout(() => {
                setIsLocked(true);
            }, timeout);
        };

        // Events to track activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        // Set initial timer
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [
        isAuthenticated,
        user?.auto_lock_enabled,
        user?.auto_lock_timeout,
        isLocked,
    ]);

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

    const setupPin = async (data: {
        pin_code: string;
        password: string;
    }): Promise<void> => {
        try {
            await authApi.setupPin(data);
            await refreshUser();
        } catch (err) {
            throw new Error(
                err instanceof Error ? err.message : 'Erreur de configuration',
            );
        }
    };

    const toggleAutoLock = async (enabled: boolean): Promise<void> => {
        try {
            await authApi.toggleAutoLock(enabled);
            await refreshUser();
        } catch (err) {
            throw new Error(
                err instanceof Error ? err.message : 'Erreur de modification',
            );
        }
    };

    const updateAutoLockTimeout = async (timeout: number): Promise<void> => {
        try {
            const userData = await authApi.updateAutoLockTimeout(timeout);
            setUser(userData);
        } catch (err) {
            throw new Error(
                err instanceof Error ? err.message : 'Erreur de modification',
            );
        }
    };

    const unlockWithPin = async (pin: string): Promise<void> => {
        if (!user?.email) throw new Error('Utilisateur non identifié');

        try {
            const response = await authApi.unlockWithPin({
                email: user.email,
                pin_code: pin,
            });
            setUser(response.user);
            setIsAuthenticated(true);
            setIsLocked(false);
        } catch (err) {
            throw new Error(
                err instanceof Error ? err.message : 'Code PIN incorrect',
            );
        }
    };

    const value: AuthContextValue = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated,
            isLocked,
            error,
            login,
            loginTwoFactor,
            register,
            logout,
            refreshUser,
            sendVerificationEmail,
            forgotPassword,
            resetPassword,
            setupPin,
            toggleAutoLock,
            updateAutoLockTimeout,
            unlockWithPin,
        }),
        [
            user,
            isLoading,
            isAuthenticated,
            isLocked,
            error,
            login,
            loginTwoFactor,
            register,
            logout,
            refreshUser,
            sendVerificationEmail,
            forgotPassword,
            resetPassword,
            setupPin,
            toggleAutoLock,
            updateAutoLockTimeout,
            unlockWithPin,
        ],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {isLocked && (
                    <UnlockScreen onSuccess={() => setIsLocked(false)} />
                )}
            </AnimatePresence>
        </AuthContext.Provider>
    );
}
