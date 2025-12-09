import {
    taskApi,
    type CreateTaskData,
    type Task,
    type UpdateTaskData,
} from '@/api/taskApi';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await taskApi.getTasks();
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
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(async (data: CreateTaskData) => {
        try {
            const newTask = await taskApi.createTask(data);
            setTasks((prev) => [...prev, newTask]);
            toast.success('Tâche créée avec succès');
            return newTask;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la création de la tâche';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const updateTask = useCallback(
        async (id: string, data: UpdateTaskData) => {
            try {
                await taskApi.updateTask(id, data);
                await fetchTasks(); // Refresh to get updated data
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
        [fetchTasks],
    );

    const toggleCompletion = useCallback(async (id: string) => {
        try {
            await taskApi.toggleCompletion(id);
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === id
                        ? { ...task, completed: !task.completed }
                        : task,
                ),
            );
            toast.success('État de la tâche modifié');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la modification de la tâche';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        try {
            await taskApi.deleteTask(id);
            setTasks((prev) => prev.filter((task) => task.id !== id));
            toast.success('Tâche supprimée avec succès');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la suppression de la tâche';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const activeTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    return {
        tasks,
        activeTasks,
        completedTasks,
        isLoading,
        error,
        createTask,
        updateTask,
        toggleCompletion,
        deleteTask,
        refetch: fetchTasks,
    };
}
