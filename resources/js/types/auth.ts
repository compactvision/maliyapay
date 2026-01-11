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
    roles?: string[]; // Add roles
    permissions: string[];
    created_at: string;
    updated_at: string;
    avatar?: string;
    play_notification_sound?: boolean;
    auto_lock_enabled?: boolean;
    auto_lock_timeout?: number;
    pin_code_set?: boolean;
    onboarded_at?: string | null;
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
    two_factor?: boolean;
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
