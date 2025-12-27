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
import { QuestLevelDetailSheet } from './QuestLevelDetailSheet';
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

    // New state for step details
    const [selectedStep, setSelectedStep] = useState<any | null>(null);
    const [showStepDetail, setShowStepDetail] = useState(false);

    const handleSelectBusiness = (business: any) => {
        setSelectedBusiness(business);

        // If user has already started this quest, skip intro
        if (business.started) {
            setShowIntro(false);
            setQuestStarted(true);
        } else {
            setShowIntro(true);
            setQuestStarted(false);
        }
    };

    const handleStartQuest = async () => {
        if (selectedBusiness) {
            try {
                await growthApi.startQuest(selectedBusiness.id);
                // Save current business to localStorage just for selection persistence
                localStorage.setItem(
                    'currentBusiness',
                    JSON.stringify(selectedBusiness),
                );

                setShowIntro(false);
                setQuestStarted(true);
                refetch(); // Refresh data to get updated 'started' status
            } catch (error) {
                toast.error("Impossible de démarrer l'aventure");
            }
        }
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
        const business = selectedBusiness || activeBusiness;
        if (!business) return;

        // Check if step is locked
        const stepIndex = business.steps.findIndex(
            (s: any) => s.id === step.id,
        );
        const isLocked =
            !step.completed &&
            stepIndex > 0 &&
            !business.steps[stepIndex - 1].completed;

        if (isLocked) {
            toast.warning("Complétez les étapes précédentes d'abord");
            return;
        }

        // If step is paid and not completed, show payment sheet
        if (step.isPaid && !step.completed) {
            setPayingStep(step);
            setShowPayment(true);
        } else {
            // SHOW DETAIL SHEET INSTEAD OF DIRECT NAV
            setSelectedStep(step);
            setShowStepDetail(true);
        }
    };

    const handleStartLevel = () => {
        if (selectedStep && selectedBusiness) {
            setShowStepDetail(false);
            // Navigate to step detail page
            router.visit(
                `/growth/business/${selectedBusiness.id}/step/${selectedStep.id}`,
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

    // Suppression de defaultBusinesses comme demandé
    const displayBusinesses = businessModels;

    // Keep track of the last active business to prevent crashes during exit animations
    const [activeBusiness, setActiveBusiness] = useState<any | null>(null);

    useEffect(() => {
        if (selectedBusiness) {
            setActiveBusiness(selectedBusiness);
        }
    }, [selectedBusiness]);

    // Restore last selected business on mount
    useEffect(() => {
        const currentBusinessStr = localStorage.getItem('currentBusiness');
        if (
            currentBusinessStr &&
            !selectedBusiness &&
            displayBusinesses.length > 0
        ) {
            try {
                const business = JSON.parse(currentBusinessStr);
                // Check if this business still exists in the list
                const exists = displayBusinesses.find(
                    (b) => b.id === business.id,
                );
                if (exists) {
                    setSelectedBusiness(exists);
                    if (exists.started) {
                        setQuestStarted(true);
                        setShowIntro(false);
                    }
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, [displayBusinesses, selectedBusiness]);

    const businessToRender = selectedBusiness || activeBusiness;

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

                        {/* Ajout de la condition pour vérifier s'il y a des business */}
                        {displayBusinesses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                <Briefcase className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                                <h4 className="text-xl font-semibold text-foreground">
                                    Aucune quête business disponible
                                </h4>
                                <p className="mt-2 text-muted-foreground">
                                    Revenez plus tard pour découvrir de nouvelles
                                    aventures.
                                </p>
                            </div>
                        ) : (
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
                                                        {business.started
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
                        )}
                    </motion.div>
                ) : businessToRender ? (
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
                                {businessToRender.title}
                            </Badge>
                        </div>

                        <QuestGameMap
                            business={businessToRender}
                            onCompleteStep={handleCompleteStep}
                            onStepClick={handleStepClick}
                        />
                    </motion.div>
                ) : null}
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

            {/* Quest Level Detail Bottom Sheet */}
            {selectedBusiness && selectedStep && (
                <QuestLevelDetailSheet
                    isOpen={showStepDetail}
                    onClose={() => setShowStepDetail(false)}
                    onStart={handleStartLevel}
                    step={selectedStep}
                    index={selectedBusiness.steps.findIndex(
                        (s: any) => s.id === selectedStep.id,
                    )}
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