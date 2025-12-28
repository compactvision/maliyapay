import axios from 'axios';

export interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    dueDate: string | null;
    completed: boolean;
    isOverdue: boolean;
    xp: number;
    routineTaskId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
}

export interface UpdateTaskData {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
}

export const taskApi = {
    async getTasks(): Promise<Task[]> {
        const response = await axios.get('/api/tasks');
        return response.data.tasks;
    },

    async createTask(data: CreateTaskData): Promise<Task> {
        const response = await axios.post('/api/tasks', data);
        return response.data.task;
    },

    async updateTask(id: string, data: UpdateTaskData): Promise<void> {
        await axios.put(`/api/tasks/${id}`, data);
    },

    async toggleCompletion(id: string): Promise<Task> {
        const response = await axios.post(`/api/tasks/${id}/toggle`);
        return response.data.task;
    },

    async deleteTask(id: string): Promise<void> {
        await axios.delete(`/api/tasks/${id}`);
    },
};
