import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGrowth } from '@/hooks/useGrowth';
import { useRoutines } from '@/hooks/useRoutines';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    Clock,
    Download,
    Gift,
    Package,
    ShoppingCart,
    Sparkles,
    Star,
    Target,
    Users,
    Zap,
} from 'lucide-react';
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card
                            key={i}
                            className="animate-pulse border-none shadow-sm"
                        >
                            <div className="h-48 rounded-t-xl bg-muted/20" />
                            <CardContent className="h-40 bg-muted/10 p-4" />
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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">
                            Kits de Routines
                        </h3>
                    </div>
                    <p className="ml-11 max-w-2xl text-sm text-muted-foreground">
                        Découvrez nos routines expertes conçues pour maximiser
                        votre potentiel.
                    </p>
                </motion.div>

                {routineKits && routineKits.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {routineKits.map((kit, index) => (
                            <motion.div
                                key={kit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group"
                            >
                                <Card className="relative h-full overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
                                    {/* Image Header */}
                                    <div className="relative h-48 overflow-hidden bg-muted/20">
                                        {kit.images && kit.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={kit.images[0]}
                                                    alt={kit.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </>
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-secondary/30 transition-colors group-hover:bg-secondary/40">
                                                <Package className="h-12 w-12 text-muted-foreground/40" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {kit.isPaid ? (
                                                <div className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 shadow-sm backdrop-blur">
                                                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        Premium
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 shadow-sm backdrop-blur">
                                                    <Gift className="h-3.5 w-3.5 text-green-500" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        Gratuit
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Color Stripe */}
                                        <div
                                            className="absolute right-0 bottom-0 left-0 h-1"
                                            style={{
                                                backgroundColor:
                                                    kit.color || '#3b82f6',
                                            }}
                                        />
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="mb-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-secondary/50 text-xs font-medium hover:bg-secondary/70"
                                                >
                                                    {kit.category || 'Général'}
                                                </Badge>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Target className="h-3.5 w-3.5" />
                                                        <span>
                                                            {kit.tasks
                                                                ?.length || 0}
                                                        </span>
                                                    </div>
                                                    {kit.imports &&
                                                        kit.imports > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span>
                                                                    {
                                                                        kit.imports
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            <h3 className="mb-1 line-clamp-1 text-lg font-bold text-foreground">
                                                {kit.name}
                                            </h3>
                                            <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                                                {kit.description ||
                                                    'Une routine optimisée pour votre succès.'}
                                            </p>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/50 pt-4">
                                            {kit.isPaid ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                    </div>
                                                    <span className="font-bold text-foreground">
                                                        {kit.priceAmount}{' '}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            {kit.priceCurrency}
                                                        </span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                                                        <Zap className="h-4 w-4 text-green-500" />
                                                    </div>
                                                    <span className="font-bold text-green-600 dark:text-green-500">
                                                        Gratuit
                                                    </span>
                                                </div>
                                            )}

                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleImportKit(kit.id)
                                                }
                                                className={`transition-all duration-300 ${
                                                    kit.isPaid
                                                        ? 'bg-foreground text-background hover:bg-foreground/90'
                                                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                }`}
                                            >
                                                {kit.isPaid ? (
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Download className="mr-2 h-4 w-4" />
                                                )}
                                                {kit.isPaid
                                                    ? 'Obtenir'
                                                    : 'Importer'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed bg-muted/10 p-12 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                        <h3 className="mb-1 text-lg font-medium">
                            Aucun kit disponible
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Revenez plus tard pour découvrir de nouvelles
                            routines.
                        </p>
                    </div>
                )}
            </section>

            {/* User Routines Section - Simplified */}
            <section>
                <div className="mb-6 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <h3 className="text-lg font-bold text-foreground">
                        Vos Routines Actives
                    </h3>
                </div>

                {routines && routines.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {routines.map((routine, index) => (
                            <motion.div
                                key={routine.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="h-full border border-border/50 transition-colors hover:border-border">
                                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-semibold">
                                            {routine.name}
                                        </CardTitle>
                                        <div
                                            className={`h-2 w-2 rounded-full ${routine.isActive ? 'bg-green-500' : 'bg-muted'}`}
                                        />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Progression</span>
                                                    <span>75%</span>
                                                </div>
                                                <Progress
                                                    value={75}
                                                    className="h-1.5"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    <span>
                                                        {new Date(
                                                            routine.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>
                                                        {routine.isActive
                                                            ? 'Active'
                                                            : 'Inactif'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-muted/10 p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Aucune routine active. Importez un kit pour
                            commencer.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default RoutinesTab;
