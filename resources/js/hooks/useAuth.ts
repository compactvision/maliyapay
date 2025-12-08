/**
 * useAuth Hook
 *
 * Custom React hook for authentication with react-hook-form
 * Now uses global AuthContext to prevent redundant API calls
 */

import { AuthContext } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
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

const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z
    .object({
        token: z.string(),
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
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Hook for authentication state and operations
 * Uses global AuthContext to share state across all components
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
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

/**
 * Hook for forgot password form
 */
export function useForgotPasswordForm(): UseFormReturn<ForgotPasswordFormValues> {
    return useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });
}

/**
 * Hook for reset password form
 */
export function useResetPasswordForm(
    token: string,
    email: string,
): UseFormReturn<ResetPasswordFormValues> {
    return useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token,
            email,
            password: '',
            password_confirmation: '',
        },
    });
}
