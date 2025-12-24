import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGrowth } from '@/hooks/useGrowth';
import { useRoutines } from '@/hooks/useRoutines';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Download, Info, Zap } from 'lucide-react';
import { useEffect } from 'react';

const RoutinesTab = () => {
    const {
        routines,
        refetch: fetchRoutines,
        isLoading: routinesLoading,
    } = useRoutines();
    const { routineKits, isLoading: growthLoading, importKit } = useGrowth();

    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleImportKit = async (id: string) => {
        const success = await importKit(id);
        if (success) {
            fetchRoutines();
        }
    };

    const isLoading = routinesLoading || growthLoading;

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                            <CardContent className="h-32 bg-muted/30" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Routine Kits Section */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            Kits de Routines
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Importez des routines expertes pour booster votre
                            productivité
                        </p>
                    </div>
                </div>

                {routineKits && routineKits.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {routineKits.map((kit, index) => (
                            <motion.div
                                key={kit.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full border-2 border-dashed transition-colors hover:border-primary/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">
                                                {kit.name}
                                            </CardTitle>
                                            <Badge variant="secondary">
                                                {kit.category || 'Général'}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {kit.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 flex items-center text-xs text-muted-foreground">
                                            <Info className="mr-1 h-3 w-3" />
                                            <span>
                                                {kit.tasks.length} tâches
                                                incluses
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="group w-full"
                                            onClick={() =>
                                                handleImportKit(kit.id)
                                            }
                                        >
                                            <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                                            Importer ce kit
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
                        Aucun kit disponible pour le moment.
                    </div>
                )}
            </section>

            <div className="h-px w-full bg-border" />

            {/* User Routines Section */}
            <section>
                <h3 className="mb-4 text-xl font-bold text-foreground">
                    Vos Routines Établies
                </h3>

                {routines && routines.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {routines.map((routine, index) => (
                            <motion.div
                                key={routine.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full overflow-hidden border-l-4 border-l-primary">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                {routine.name}
                                            </CardTitle>
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2 space-y-4">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="mr-2 h-4 w-4" />
                                                <span>
                                                    {routine.isActive
                                                        ? 'Active'
                                                        : 'Inactif'}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Progression</span>
                                                    <span className="font-bold">
                                                        75%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={75}
                                                    className="h-2"
                                                />
                                            </div>

                                            <div className="flex items-center pt-2 text-xs text-muted-foreground">
                                                <CalendarDays className="mr-2 h-3 w-3" />
                                                <span>
                                                    Créé le{' '}
                                                    {new Date(
                                                        routine.createdAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-card/50 py-12 text-center">
                        <Zap className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium">
                            Aucune routine active
                        </h3>
                        <p className="text-muted-foreground">
                            Commencez par créer une routine ou importez un kit
                            pour suivre vos progrès.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default RoutinesTab;
