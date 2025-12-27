import axios from 'axios';

export interface Advice {
    id: string;
    title: string;
    summary: string;
    content: string | null;
    category: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    authorName?: string;
    videoUrl?: string;
    readingTimeMinutes?: number;
    views?: number;
    viewsCount?: number;
    shares?: number;
    engagement?: number;
    growth?: number;
    images?: string[];
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RoutineKitTask {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    dayOfWeek: number | null;
    timeStart: string | null;
    timeEnd: string | null;
    priority: 'low' | 'medium' | 'high';
    completed?: boolean;
}

export interface RoutineKit {
    id: string;
    name: string;
    status: 'draft' | 'published' | 'archived';
    description: string | null;
    category: string | null;
    color: string | null;
    isPaid?: boolean;
    priceAmount?: number;
    priceCurrency?: string;
    views?: number;
    imports?: number;
    growth?: number;
    shares?: number;
    engagement?: number;
    images?: string[];
    tasks: RoutineKitTask[];
}

export interface BusinessStep {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    isPaid?: boolean;
    priceAmount?: number;
}

export interface BusinessModel {
    id: string;
    title: string;
    description: string;
    icon: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    potential: string;
    sector?: string;
    status?: 'draft' | 'published' | 'archived';
    views?: number;
    shares?: number;
    engagement?: number;
    growth?: number;
    players?: number;
    image?: string;
    season?: string;
    cycleDuration?: string;
    soilTypes?: string[];
    yieldPotential?: string;
    mainRisks?: string[];
    businessPlan?: any;
    steps: BusinessStep[];
}

export const growthApi = {
    async getGrowthData(): Promise<{
        advices: Advice[];
        routine_kits: RoutineKit[];
        business_models: BusinessModel[];
    }> {
        const response = await axios.get('/api/growth');
        return response.data;
    },

    async importRoutineKit(id: string): Promise<{ message: string }> {
        const response = await axios.post(
            `/api/growth/routine-kits/${id}/import`,
        );
        return response.data;
    },

    async createAdvice(data: any): Promise<{ message: string }> {
        const response = await axios.post('/admin/growth/advices', data);
        return response.data;
    },

    async updateAdvice(id: string, data: any): Promise<{ message: string }> {
        // If data is FormData, Laravel might need POST with _method=PUT
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await axios.post(
                `/admin/growth/advices/${id}`,
                data,
            );
            return response.data;
        }
        const response = await axios.put(`/admin/growth/advices/${id}`, data);
        return response.data;
    },

    async deleteAdvice(id: string): Promise<{ message: string }> {
        const response = await axios.delete(`/admin/growth/advices/${id}`);
        return response.data;
    },

    async createRoutineKit(data: any): Promise<{ message: string }> {
        const response = await axios.post('/admin/growth/routine-kits', data);
        return response.data;
    },

    async updateRoutineKit(
        id: string,
        data: any,
    ): Promise<{ message: string }> {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await axios.post(
                `/admin/growth/routine-kits/${id}`,
                data,
            );
            return response.data;
        }
        const response = await axios.put(
            `/admin/growth/routine-kits/${id}`,
            data,
        );
        return response.data;
    },

    async deleteRoutineKit(id: string): Promise<{ message: string }> {
        const response = await axios.delete(`/admin/growth/routine-kits/${id}`);
        return response.data;
    },

    async createBusinessModel(data: any): Promise<{ message: string }> {
        const response = await axios.post(
            '/admin/growth/business-models',
            data,
        );
        return response.data;
    },

    async updateBusinessModel(
        id: string,
        data: any,
    ): Promise<{ message: string }> {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await axios.post(
                `/admin/growth/business-models/${id}`,
                data,
            );
            return response.data;
        }
        const response = await axios.put(
            `/admin/growth/business-models/${id}`,
            data,
        );
        return response.data;
    },

    async deleteBusinessModel(id: string): Promise<{ message: string }> {
        const response = await axios.delete(
            `/admin/growth/business-models/${id}`,
        );
        return response.data;
    },
    async updateBusinessProgress(
        businessModelId: string,
        stepId: string,
    ): Promise<{ message: string }> {
        const response = await axios.post('/api/growth/progress', {
            business_model_id: businessModelId,
            step_id: stepId,
        });
        return response.data;
    },
};
