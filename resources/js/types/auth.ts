/**
 * Auth Types
 *
 * TypeScript types for Identity/Auth module
 */

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: string[];
    permissions: string[];
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface UserResponse {
    user: User;
}

export interface ProfileUpdateData {
    name?: string;
    email?: string;
}

export interface PasswordChangeData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface AuthError {
    message: string;
    error?: string;
    errors?: Record<string, string[]>;
}
