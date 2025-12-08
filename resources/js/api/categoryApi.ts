/**
 * Category API Client
 *
 * Axios-based API client for Category operations
 */

import type {
    Category,
    CategoryError,
    CategoryFormData,
    CategoryListResponse,
    CategoryResponse,
    CategoryType,
} from '@/types/category';
import axios, { AxiosError } from 'axios';

// Configure axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Add CSRF token and auth token to requests
api.interceptors.request.use((config) => {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Add auth token if exists
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

/**
 * Category API
 */
export const categoryApi = {
    /**
     * Get all categories
     */
    async getAll(): Promise<Category[]> {
        try {
            const response = await api.get<CategoryListResponse>('/categories');
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get a single category by ID
     */
    async getById(id: string): Promise<Category> {
        try {
            const response = await api.get<CategoryResponse>(
                `/categories/${id}`,
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get categories by type
     */
    async getByType(type: CategoryType): Promise<Category[]> {
        try {
            const response = await api.get<CategoryListResponse>(
                `/categories/type/${type}`,
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Create a new category
     */
    async create(data: CategoryFormData): Promise<Category> {
        try {
            const response = await api.post<CategoryResponse>(
                '/categories',
                data,
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Update an existing category
     */
    async update(id: string, data: CategoryFormData): Promise<Category> {
        try {
            const response = await api.put<CategoryResponse>(
                `/categories/${id}`,
                data,
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Delete a category
     */
    async delete(id: string): Promise<void> {
        try {
            await api.delete(`/categories/${id}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

/**
 * Handle API errors
 */
function handleApiError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CategoryError>;
        const message =
            axiosError.response?.data?.message || axiosError.message;
        const errorDetails = axiosError.response?.data?.error;

        return new Error(errorDetails || message);
    }

    return error as Error;
}
