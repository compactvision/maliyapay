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
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    Code,
    Rocket,
    ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { growthApi } from '@/api/growthApi';
import { useGrowth } from '@/hooks/useGrowth';
import { toast } from 'sonner';
import { QuestGameMap } from './QuestGameMap';
import { QuestIntroBottomSheet } from './QuestIntroBottomSheet';
import { QuestPaymentBottomSheet } from './QuestPaymentBottomSheet';

const ICON_MAP = {
    ShoppingCart,
    Briefcase,
    Code,
    Rocket,
};

const BusinessGameTab = () => {
    const { businessModels, isLoading, refetch } = useGrowth();
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [showIntro, setShowIntro] = useState(false);
    const [questStarted, setQuestStarted] = useState(false);
    const [payingStep, setPayingStep] = useState<any | null>(null);
    const [showPayment, setShowPayment] = useState(false);

    // Check if user has already started this quest
    const hasStartedQuest = (businessId: string) => {
        const startedQuests = JSON.parse(
            localStorage.getItem('startedQuests') || '[]',
        );
        return startedQuests.includes(businessId);
    };

    // Mark quest as started
    const markQuestAsStarted = (businessId: string) => {
        const startedQuests = JSON.parse(
            localStorage.getItem('startedQuests') || '[]',
        );
        if (!startedQuests.includes(businessId)) {
            startedQuests.push(businessId);
            localStorage.setItem(
                'startedQuests',
                JSON.stringify(startedQuests),
            );
        }
    };

    const handleSelectBusiness = (business: any) => {
        setSelectedBusiness(business);

        // If user has already started this quest, skip intro
        if (hasStartedQuest(business.id)) {
            setShowIntro(false);
            setQuestStarted(true);
        } else {
            setShowIntro(true);
            setQuestStarted(false);
        }
    };

    const handleStartQuest = () => {
        if (selectedBusiness) {
            markQuestAsStarted(selectedBusiness.id);
            // Save current business to localStorage
            localStorage.setItem(
                'currentBusiness',
                JSON.stringify(selectedBusiness),
            );
        }
        setShowIntro(false);
        setQuestStarted(true);
    };

    const handleReset = () => {
        setSelectedBusiness(null);
        setShowIntro(false);
        setQuestStarted(false);
        localStorage.removeItem('currentBusiness');
    };

    const handleCompleteStep = async (businessId: string, stepId: string) => {
        try {
            await growthApi.updateBusinessProgress(businessId, stepId);
            toast.success('Étape terminée ! 🎉');
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

    const handleStepClick = (step: any) => {
        // Check if step is locked
        const stepIndex = selectedBusiness.steps.findIndex(
            (s: any) => s.id === step.id,
        );
        const isLocked =
            !step.completed &&
            stepIndex > 0 &&
            !selectedBusiness.steps[stepIndex - 1].completed;

        if (isLocked) {
            toast.warning("Complétez les étapes précédentes d'abord");
            return;
        }

        // If step is paid and not completed, show payment sheet
        if (step.isPaid && !step.completed) {
            setPayingStep(step);
            setShowPayment(true);
        } else {
            // Navigate to step detail page
            router.visit(
                `/growth/business/${selectedBusiness.id}/step/${step.id}`,
            );
        }
    };

    const handlePaymentSubmit = () => {
        if (payingStep && selectedBusiness) {
            // Close the payment sheet
            setShowPayment(false);
            // Redirect to payment gateway with proper parameters
            window.location.href = `/payment/checkout?type=business_step&item_id=${payingStep.id}&business_id=${selectedBusiness.id}`;
        }
    };

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
                    completed: false,
                },
                {
                    id: '2',
                    title: 'Sourcing produits',
                    description: 'Trouvez des fournisseurs fiables.',
                    completed: false,
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

    // Restore last selected business on mount
    useEffect(() => {
        const currentBusiness = localStorage.getItem('currentBusiness');
        if (currentBusiness && !selectedBusiness) {
            try {
                const business = JSON.parse(currentBusiness);
                // Check if this business still exists in the list
                const exists = displayBusinesses.find(
                    (b) => b.id === business.id,
                );
                if (exists && hasStartedQuest(business.id)) {
                    setSelectedBusiness(business);
                    setQuestStarted(true);
                    setShowIntro(false);
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, [displayBusinesses, selectedBusiness]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                    <p className="text-muted-foreground">
                        Chargement de l'aventure...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedBusiness || !questStarted ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="mb-8 space-y-2 text-center">
                            <h3 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                Choisissez votre Aventure
                            </h3>
                            <p className="mx-auto max-w-lg text-muted-foreground">
                                Sélectionnez un modèle d'affaires et suivez les
                                étapes pour bâtir votre empire.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                            className="group flex h-full cursor-pointer flex-col border-2 transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20"
                                            onClick={() =>
                                                handleSelectBusiness(business)
                                            }
                                        >
                                            <CardHeader>
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                                                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <CardTitle>
                                                    {business.title}
                                                </CardTitle>
                                                <div className="mt-2 flex gap-2">
                                                    <Badge variant="secondary">
                                                        {business.difficulty}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                                                    >
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
                                                <Button className="group/btn w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all hover:shadow-emerald-500/50">
                                                    {hasStartedQuest(
                                                        business.id,
                                                    )
                                                        ? 'Continuer'
                                                        : 'Démarrer'}{' '}
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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
                                className="pl-0 hover:bg-transparent hover:text-emerald-600"
                            >
                                ← Retour au choix
                            </Button>
                            <Badge
                                variant="outline"
                                className="border-emerald-500/50 px-4 py-1 text-lg text-emerald-600 dark:text-emerald-400"
                            >
                                {selectedBusiness.title}
                            </Badge>
                        </div>

                        <QuestGameMap
                            business={selectedBusiness}
                            onCompleteStep={handleCompleteStep}
                            onStepClick={handleStepClick}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quest Introduction Bottom Sheet */}
            {selectedBusiness && (
                <QuestIntroBottomSheet
                    isOpen={showIntro}
                    onClose={() => setShowIntro(false)}
                    onStart={handleStartQuest}
                    business={selectedBusiness}
                />
            )}

            {selectedBusiness && payingStep && (
                <QuestPaymentBottomSheet
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onPay={handlePaymentSubmit}
                    step={payingStep}
                    business={selectedBusiness}
                />
            )}
        </div>
    );
};

export default BusinessGameTab;
