/**
 * Category Types
 *
 * TypeScript types for Category module
 */

export type CategoryType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface CategoryFormData {
    name: string;
    type: CategoryType;
    color: string;
}

export interface CategoryListResponse {
    data: Category[];
    meta: {
        total: number;
    };
}

export interface CategoryResponse {
    data: Category;
}

export interface CategoryError {
    message: string;
    error?: string;
    errors?: Record<string, string[]>;
}
