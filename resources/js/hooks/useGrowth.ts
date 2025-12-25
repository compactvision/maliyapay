import {
    growthApi,
    type Advice,
    type BusinessModel,
    type RoutineKit,
} from '@/api/growthApi';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useGrowth() {
    const [advices, setAdvices] = useState<Advice[]>([]);
    const [routineKits, setRoutineKits] = useState<RoutineKit[]>([]);
    const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await growthApi.getGrowthData();
            setAdvices(data.advices);
            setRoutineKits(data.routine_kits);
            setBusinessModels(data.business_models);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur lors du chargement des données de croissance';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const importKit = useCallback(async (id: string) => {
        try {
            const response = await growthApi.importRoutineKit(id);
            toast.success(response.message || 'Routine importée avec succès');
            return true;
        } catch (err: any) {
            // Extract error message from axios error response
            const errorMessage =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Erreur lors de l'importation de la routine";
            toast.error(errorMessage);
            return false;
        }
    }, []);

    return {
        advices,
        routineKits,
        businessModels,
        isLoading,
        error,
        refetch: fetchData,
        importKit,
    };
}
