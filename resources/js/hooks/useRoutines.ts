import {
    routineApi,
    type CreateRoutineData,
    type Routine,
    type RoutineTask,
    type UpdateRoutineData,
} from '@/api/routineApi';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useRoutines() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoutines = useCallback(async (activeOnly = false) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await routineApi.getRoutines(activeOnly);
            setRoutines(data);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors du chargement des routines';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutines();
    }, [fetchRoutines]);

    const createRoutine = useCallback(async (data: CreateRoutineData) => {
        try {
            const newRoutine = await routineApi.createRoutine(data);
            setRoutines((prev) => [...prev, newRoutine]);
            toast.success('Routine créée avec succès');
            return newRoutine;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la création de la routine';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const updateRoutine = useCallback(
        async (id: string, data: UpdateRoutineData) => {
            try {
                await routineApi.updateRoutine(id, data);
                await fetchRoutines();
                toast.success('Routine mise à jour avec succès');
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Erreur lors de la mise à jour de la routine';
                toast.error(errorMessage);
                throw err;
            }
        },
        [fetchRoutines],
    );

    const toggleActive = useCallback(async (id: string) => {
        try {
            await routineApi.toggleActive(id);
            setRoutines((prev) =>
                prev.map((routine) =>
                    routine.id === id
                        ? { ...routine, isActive: !routine.isActive }
                        : routine,
                ),
            );
            toast.success('État de la routine modifié');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la modification de la routine';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const deleteRoutine = useCallback(async (id: string) => {
        try {
            await routineApi.deleteRoutine(id);
            setRoutines((prev) => prev.filter((routine) => routine.id !== id));
            toast.success('Routine supprimée avec succès');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors de la suppression de la routine';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    const activeRoutines = routines.filter((r) => r.isActive);
    const inactiveRoutines = routines.filter((r) => !r.isActive);

    return {
        routines,
        activeRoutines,
        inactiveRoutines,
        isLoading,
        error,
        createRoutine,
        updateRoutine,
        toggleActive,
        deleteRoutine,
        refetch: fetchRoutines,
    };
}

export function useRoutineTasksForDay(dayOfWeek: number) {
    const [tasks, setTasks] = useState<RoutineTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await routineApi.getTasksForDay(dayOfWeek);
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
    }, [dayOfWeek]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        error,
        refetch: fetchTasks,
    };
}

// Hook to get ALL routine tasks (not filtered by day)
export function useAllRoutineTasks() {
    const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await routineApi.getAllRoutineTasks();
            setRoutineTasks(data);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors du chargement des tâches de routine';
            setError(errorMessage);
            // Don't show toast for this, it's background data
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllTasks();
    }, [fetchAllTasks]);

    return {
        routineTasks,
        isLoading,
        error,
        refetch: fetchAllTasks,
    };
}
