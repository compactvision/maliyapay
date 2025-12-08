/**
 * useCategories Hook
 *
 * Custom React hook for managing categories with react-hook-form
 */

import { categoryApi } from '@/api/categoryApi';
import type {
    Category,
    CategoryFormData,
    CategoryType,
} from '@/types/category';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Validation schema
const categorySchema = z.object({
    name: z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    type: z.enum(['income', 'expense'], {
        required_error: 'Le type est requis',
    }),
    color: z
        .string()
        .regex(
            /^#[0-9A-F]{6}$/i,
            'La couleur doit être au format hexadécimal (#RRGGBB)',
        ),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

/**
 * Hook for fetching and managing categories
 */
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch categories',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories,
    };
}

/**
 * Hook for fetching categories by type
 */
export function useCategoriesByType(type: CategoryType) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await categoryApi.getByType(type);
            setCategories(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch categories',
            );
        } finally {
            setIsLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories,
    };
}

/**
 * Hook for fetching a single category
 */
export function useCategory(id: string | null) {
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setCategory(null);
            return;
        }

        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await categoryApi.getById(id);
                setCategory(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch category',
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    return {
        category,
        isLoading,
        error,
    };
}

/**
 * Hook for category mutations (create, update, delete)
 */
export function useCategoryMutations() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (
        data: CategoryFormData,
    ): Promise<Category | null> => {
        try {
            setIsSubmitting(true);
            setError(null);
            const category = await categoryApi.create(data);
            return category;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to create category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateCategory = async (
        id: string,
        data: CategoryFormData,
    ): Promise<Category | null> => {
        try {
            setIsSubmitting(true);
            setError(null);
            const category = await categoryApi.update(id, data);
            return category;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to update category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteCategory = async (id: string): Promise<void> => {
        try {
            setIsSubmitting(true);
            setError(null);
            await categoryApi.delete(id);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to delete category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        isSubmitting,
        error,
    };
}

/**
 * Hook for category form with react-hook-form
 */
export function useCategoryForm(
    defaultValues?: Partial<CategoryFormValues>,
): UseFormReturn<CategoryFormValues> {
    return useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            type: 'expense',
            color: '#EF4444',
            ...defaultValues,
        },
    });
}
