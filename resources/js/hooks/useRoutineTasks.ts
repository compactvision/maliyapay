import { routineApi, type RoutineTask } from '@/api/routineApi';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useRoutineTasks(routineId: string | null) {
    const [tasks, setTasks] = useState<RoutineTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!routineId) {
            setTasks([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await routineApi.getRoutineTasks(routineId);
            setTasks(data);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors du chargement des tâches';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [routineId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(
        async (data: {
            title: string;
            description?: string;
            dayOfWeek: number;
            timeStart?: string;
            timeEnd?: string;
            priority: 'low' | 'medium' | 'high';
            orderIndex?: number;
        }) => {
            if (!routineId) return;

            try {
                const newTask = await routineApi.createRoutineTask(
                    routineId,
                    data,
                );
                setTasks((prev) => [...prev, newTask]);
                toast.success('Tâche ajoutée avec succès');
                return newTask;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Erreur lors de la création de la tâche';
                toast.error(errorMessage);
                throw err;
            }
        },
        [routineId],
    );

    const updateTask = useCallback(
        async (
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
        ) => {
            if (!routineId) return;

            try {
                await routineApi.updateRoutineTask(routineId, taskId, data);
                await fetchTasks();
                toast.success('Tâche mise à jour avec succès');
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Erreur lors de la mise à jour de la tâche';
                toast.error(errorMessage);
                throw err;
            }
        },
        [routineId, fetchTasks],
    );

    const deleteTask = useCallback(
        async (taskId: string) => {
            if (!routineId) return;

            try {
                await routineApi.deleteRoutineTask(routineId, taskId);
                setTasks((prev) => prev.filter((task) => task.id !== taskId));
                toast.success('Tâche supprimée avec succès');
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Erreur lors de la suppression de la tâche';
                toast.error(errorMessage);
                throw err;
            }
        },
        [routineId],
    );

    const getTasksByDay = useCallback(
        (dayOfWeek: number) => {
            return tasks.filter((task) => task.dayOfWeek === dayOfWeek);
        },
        [tasks],
    );

    return {
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        getTasksByDay,
        refetch: fetchTasks,
    };
}
