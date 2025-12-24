import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    CheckCircle,
    Code,
    Lock,
    Rocket,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';

import { growthApi } from '@/api/growthApi';
import { useGrowth } from '@/hooks/useGrowth';
import { toast } from 'sonner';

const ICON_MAP = {
    ShoppingCart,
    Briefcase,
    Code,
    Rocket,
};

const BusinessGameTab = () => {
    const { businessModels, isLoading, refetch } = useGrowth();
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

    const handleSelectBusiness = (business: any) => {
        setSelectedBusiness(business);
    };

    const handleReset = () => {
        setSelectedBusiness(null);
    };

    const handleCompleteStep = async (businessId: string, stepId: string) => {
        try {
            await growthApi.updateBusinessProgress(businessId, stepId);
            toast.success('Étape terminée !');
            // Optimistic update
            if (selectedBusiness) {
                const newSteps = selectedBusiness.steps.map((s: any) =>
                    s.id === stepId ? { ...s, completed: true } : s,
                );
                setSelectedBusiness({ ...selectedBusiness, steps: newSteps });
            }
            refetch();
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const calculateProgress = (steps: any[]) => {
        if (!steps || steps.length === 0) return 0;
        const completed = steps.filter((s) => s.completed).length;
        return Math.round((completed / steps.length) * 100);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                Chargement de l'aventure...
            </div>
        );
    }

    const defaultBusinesses = [
        {
            id: 'ecommerce',
            title: 'E-commerce',
            icon: 'ShoppingCart',
            description:
                'Lancez votre boutique en ligne et vendez des produits au monde entier.',
            difficulty: 'Moyen',
            potential: 'Élevé',
            steps: [
                {
                    id: '1',
                    title: 'Étude de marché',
                    description:
                        'Analysez la concurrence et trouvez votre niche.',
                    completed: true,
                },
                {
                    id: '2',
                    title: 'Sourcing produits',
                    description: 'Trouvez des fournisseurs fiables.',
                    completed: true,
                },
                {
                    id: '3',
                    title: 'Création du site',
                    description:
                        'Configurez votre boutique Shopify ou WooCommerce.',
                    completed: false,
                },
                {
                    id: '4',
                    title: 'Marketing digital',
                    description: 'Lancez vos premières publicités.',
                    completed: false,
                },
                {
                    id: '5',
                    title: 'Première vente',
                    description: 'Le moment de vérité !',
                    completed: false,
                },
            ],
        },
    ];

    const displayBusinesses =
        businessModels.length > 0 ? businessModels : defaultBusinesses;

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedBusiness ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="mb-8 space-y-2 text-center">
                            <h3 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                                Choisissez votre Aventure
                            </h3>
                            <p className="mx-auto max-w-lg text-muted-foreground">
                                Sélectionnez un modèle d'affaires et suivez les
                                étapes pour bâtir votre empire.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {displayBusinesses.map((business, idx) => {
                                const Icon =
                                    ICON_MAP[
                                        business.icon as keyof typeof ICON_MAP
                                    ] || Rocket;
                                return (
                                    <motion.div
                                        key={business.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card
                                            className="flex h-full cursor-pointer flex-col border-2 transition-colors hover:border-primary"
                                            onClick={() =>
                                                handleSelectBusiness(business)
                                            }
                                        >
                                            <CardHeader>
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <CardTitle>
                                                    {business.title}
                                                </CardTitle>
                                                <div className="mt-2 flex gap-2">
                                                    <Badge variant="secondary">
                                                        {business.difficulty}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {business.potential}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <CardDescription className="text-base">
                                                    {business.description}
                                                </CardDescription>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="group w-full">
                                                    Démarrer{' '}
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="pl-0 hover:bg-transparent"
                            >
                                ← Retour au choix
                            </Button>
                            <Badge
                                variant="outline"
                                className="px-4 py-1 text-lg"
                            >
                                {selectedBusiness.title}
                            </Badge>
                        </div>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="mb-2 flex items-end justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            Progression Globale
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Niveau 1 - Débutant
                                        </p>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">
                                        {calculateProgress(
                                            selectedBusiness.steps,
                                        )}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={calculateProgress(
                                        selectedBusiness.steps,
                                    )}
                                    className="h-4"
                                />
                            </CardContent>
                        </Card>

                        <div className="relative ml-4 space-y-8 border-l-2 border-muted py-4 pl-8 md:ml-8 md:pl-12">
                            {selectedBusiness.steps.map(
                                (step: any, index: number) => {
                                    const isCompleted = step.completed;
                                    const isCurrent =
                                        !step.completed &&
                                        (index === 0 ||
                                            selectedBusiness.steps[index - 1]
                                                .completed);
                                    const isLocked =
                                        !step.completed && !isCurrent;

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`relative ${isLocked ? 'opacity-50 blur-[0.5px]' : ''}`}
                                        >
                                            <div
                                                className={`absolute top-1 -left-[43px] h-6 w-6 rounded-full border-4 md:-left-[59px] ${
                                                    isCompleted
                                                        ? 'border-green-500 bg-green-500'
                                                        : isCurrent
                                                          ? 'border-primary bg-background ring-4 ring-primary/20'
                                                          : 'border-muted bg-background'
                                                } flex items-center justify-center`}
                                            >
                                                {isCompleted && (
                                                    <CheckCircle className="h-3 w-3 text-white" />
                                                )}
                                                {isLocked && (
                                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </div>

                                            <Card
                                                className={`${isCurrent ? 'border-primary shadow-md' : ''}`}
                                            >
                                                <CardHeader className="py-4">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                                            {step.title}
                                                            {isCurrent && (
                                                                <Badge className="ml-2 animate-pulse">
                                                                    En cours
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        {isCompleted && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                            >
                                                                Terminé
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription>
                                                        {step.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                {isCurrent && (
                                                    <CardFooter className="pt-0">
                                                        <Button
                                                            size="sm"
                                                            className="w-full md:w-auto"
                                                            onClick={() =>
                                                                handleCompleteStep(
                                                                    selectedBusiness.id,
                                                                    step.id,
                                                                )
                                                            }
                                                        >
                                                            Marquer comme
                                                            terminé
                                                        </Button>
                                                    </CardFooter>
                                                )}
                                            </Card>
                                        </motion.div>
                                    );
                                },
                            )}

                            <div className="pointer-events-none absolute bottom-0 -left-[5px] h-full w-full">
                                <Rocket className="absolute bottom-0 -left-[18px] h-10 w-10 text-muted-foreground/20 md:-left-[26px]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessGameTab;
