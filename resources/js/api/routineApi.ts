import axios from 'axios';

export interface Routine {
    id: string;
    name: string;
    color: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoutineTask {
    id: string;
    routineId: string;
    title: string;
    description: string | null;
    dayOfWeek: number; // 1-7
    dayLabel: string;
    dayShortLabel: string;
    timeStart: string | null;
    timeEnd: string | null;
    timeRange: string;
    priority: 'low' | 'medium' | 'high';
    xp: number;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoutineData {
    name: string;
    color?: string;
    tasks?: {
        title: string;
        description?: string;
        dayOfWeek: number;
        timeStart?: string;
        timeEnd?: string;
        priority?: 'low' | 'medium' | 'high';
        orderIndex?: number;
    }[];
}

export interface UpdateRoutineData {
    name: string;
    color?: string;
}

export const routineApi = {
    async getRoutines(activeOnly = false): Promise<Routine[]> {
        const response = await axios.get('/api/routines', {
            params: { active_only: activeOnly },
        });
        return response.data.routines;
    },

    async createRoutine(data: CreateRoutineData): Promise<Routine> {
        const response = await axios.post('/api/routines', data);
        return response.data.routine;
    },

    async updateRoutine(id: string, data: UpdateRoutineData): Promise<void> {
        await axios.put(`/api/routines/${id}`, data);
    },

    async toggleActive(id: string): Promise<void> {
        await axios.post(`/api/routines/${id}/toggle`);
    },

    async deleteRoutine(id: string): Promise<void> {
        await axios.delete(`/api/routines/${id}`);
    },

    async getTasksForDay(dayOfWeek: number): Promise<RoutineTask[]> {
        const response = await axios.get(`/api/routine-tasks/day/${dayOfWeek}`);
        return response.data.tasks;
    },

    async getAllRoutineTasks(): Promise<RoutineTask[]> {
        const response = await axios.get('/api/routine-tasks');
        return response.data.tasks;
    },

    // Routine Tasks Management
    async getRoutineTasks(routineId: string): Promise<RoutineTask[]> {
        const response = await axios.get(`/api/routines/${routineId}/tasks`);
        return response.data.tasks;
    },

    async createRoutineTask(
        routineId: string,
        data: {
            title: string;
            description?: string;
            dayOfWeek: number;
            timeStart?: string;
            timeEnd?: string;
            priority: 'low' | 'medium' | 'high';
            orderIndex?: number;
        },
    ): Promise<RoutineTask> {
        const response = await axios.post(
            `/api/routines/${routineId}/tasks`,
            data,
        );
        return response.data.task;
    },

    async updateRoutineTask(
        routineId: string,
        taskId: string,
        data: {
            title: string;
            description?: string;
            dayOfWeek: number;
            timeStart?: string;
            timeEnd?: string;
            priority: 'low' | 'medium' | 'high';
            orderIndex?: number;
        },
    ): Promise<void> {
        await axios.put(`/api/routines/${routineId}/tasks/${taskId}`, data);
    },

    async deleteRoutineTask(routineId: string, taskId: string): Promise<void> {
        await axios.delete(`/api/routines/${routineId}/tasks/${taskId}`);
    },
};
