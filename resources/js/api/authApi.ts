/**
 * Auth API Client
 *
 * Axios-based API client for authentication operations
 */

import type {
    AuthError,
    AuthResponse,
    LoginCredentials,
    PasswordChangeData,
    ProfileUpdateData,
    RegisterData,
    User,
    UserResponse,
} from '@/types/auth';
import axios, { AxiosError } from 'axios';

// Configure axios instance
const api = axios.create({
    baseURL: '/api/auth',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }

    // Add auth token if exists
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

/**
 * Auth API
 */
export const authApi = {
    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/register', data);

            // Store token
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(
                '/login',
                credentials,
            );

            // Store token
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Handle two-factor challenge
     */
    async loginTwoFactor(data: {
        code?: string;
        recovery_code?: string;
    }): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(
                '/two-factor-challenge',
                data,
            );

            // Store token
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await api.post('/logout');
            localStorage.removeItem('auth_token');
        } catch (error) {
            // Always clear token even if request fails
            localStorage.removeItem('auth_token');
            throw handleApiError(error);
        }
    },

    /**
     * Get authenticated user
     */
    async getUser(): Promise<User> {
        try {
            const response = await api.get<UserResponse>('/user');
            return response.data.user;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(data: ProfileUpdateData): Promise<User> {
        try {
            const response = await api.put<UserResponse>('/profile', data);
            return response.data.user;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Change password
     */
    async changePassword(data: PasswordChangeData): Promise<void> {
        try {
            await api.post('/password', data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },

    /**
     * Get stored token
     */
    /**
     * Send verification email
     */
    async sendVerificationEmail(): Promise<void> {
        try {
            await api.post('/email/verification-notification');
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Forgot password
     */
    async forgotPassword(data: { email: string }): Promise<void> {
        try {
            await api.post('/forgot-password', data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Reset password
     */
    async resetPassword(data: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> {
        try {
            await api.post('/reset-password', data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },
};

/**
 * Handle API errors
 */
function handleApiError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AuthError>;
        const message =
            axiosError.response?.data?.message || axiosError.message;
        const errorDetails = axiosError.response?.data?.error;

        // Handle validation errors
        if (axiosError.response?.data?.errors) {
            const validationErrors = axiosError.response.data.errors;
            const firstError = Object.values(validationErrors)[0]?.[0];
            return new Error(firstError || message);
        }

        return new Error(errorDetails || message);
    }

    return error as Error;
}
