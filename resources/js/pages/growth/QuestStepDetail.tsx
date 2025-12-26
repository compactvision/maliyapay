import { growthApi } from '@/api/growthApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AppLayout } from '@/layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Lightbulb,
    ListChecks,
    Sparkles,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const LEVEL_ICONS = [Target, Zap, Star, Trophy, Sparkles];

interface StepDetailProps {
    business: {
        id: string;
        title: string;
        steps: Array<{
            id: string;
            title: string;
            description: string;
            completed?: boolean;
            level?: number;
            objective?: string;
            knowledge?: string[];
            actions?: string[];
        }>;
    };
    stepId: string;
    [key: string]: any;
}

const QuestStepDetail = () => {
    const { business, stepId } = usePage<StepDetailProps>().props;

    const step = business.steps.find((s) => s.id === stepId);
    const stepIndex = business.steps.findIndex((s) => s.id === stepId);

    if (!step) {
        return (
            <AppLayout>
                <div className="flex h-screen items-center justify-center">
                    <p>Étape non trouvée</p>
                </div>
            </AppLayout>
        );
    }

    const Icon = LEVEL_ICONS[stepIndex % LEVEL_ICONS.length];
    const isCurrent =
        !step.completed &&
        (stepIndex === 0 || business.steps[stepIndex - 1].completed);
    const isLocked = !step.completed && !isCurrent;

    const handleCompleteStep = async () => {
        try {
            await growthApi.updateBusinessProgress(business.id, step.id);
            toast.success('Étape terminée ! 🎉');
            // Return to growth page - BusinessGameTab will restore state from localStorage
            router.visit('/growth?tab=business');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleBack = () => {
        // Return to growth page - BusinessGameTab will restore state from localStorage
        router.visit('/growth?tab=business');
    };

    return (
        <AppLayout>
            <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="gap-2 pl-0 hover:bg-transparent hover:text-emerald-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la map
                    </Button>
                    <Badge
                        variant="outline"
                        className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    >
                        {business.title}
                    </Badge>
                </motion.div>

                {/* Step Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-background">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 shadow-lg ${
                                        step.completed
                                            ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600'
                                            : isCurrent
                                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600'
                                              : 'border-muted bg-muted/50 grayscale'
                                    }`}
                                >
                                    {step.completed ? (
                                        <CheckCircle2 className="h-8 w-8 text-white" />
                                    ) : (
                                        <Icon className="h-8 w-8 text-white" />
                                    )}
                                </div>

                                {/* Title & Badges */}
                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            Niveau {stepIndex + 1}
                                        </Badge>
                                        {isCurrent && (
                                            <Badge className="animate-pulse bg-emerald-600">
                                                En cours
                                            </Badge>
                                        )}
                                        {step.completed && (
                                            <Badge className="bg-green-600">
                                                ✓ Terminé
                                            </Badge>
                                        )}
                                        {isLocked && (
                                            <Badge variant="secondary">
                                                Verrouillé
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl md:text-3xl">
                                        {step.title}
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        {step.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Objective */}
                {step.objective && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-amber-500/10 p-2">
                                        <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        Objectif
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {step.objective}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Knowledge Section */}
                {step.knowledge && step.knowledge.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-blue-500/10 p-2">
                                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        Connaissances Requises
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {step.knowledge.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.4 + index * 0.1,
                                            }}
                                            className="flex items-start gap-2"
                                        >
                                            <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-muted-foreground">
                                                {item}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Actions Section */}
                {step.actions && step.actions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-emerald-500/10 p-2">
                                        <ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        Actions à Réaliser
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {step.actions.map((action, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.5 + index * 0.1,
                                            }}
                                            className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                                        >
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {index + 1}
                                            </div>
                                            <span className="text-muted-foreground">
                                                {action}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Complete Button */}
                {isCurrent && !isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="sticky bottom-6"
                    >
                        <Button
                            onClick={handleCompleteStep}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-lg font-bold text-white shadow-lg hover:shadow-emerald-500/50"
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Marquer comme terminé
                        </Button>
                    </motion.div>
                )}

                {/* Locked Message */}
                {isLocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="border-amber-500/30 bg-amber-500/5">
                            <CardContent className="flex items-center gap-3 py-4">
                                <div className="rounded-full bg-amber-500/10 p-2">
                                    <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Complétez les étapes précédentes pour
                                    débloquer ce niveau.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
};

export default QuestStepDetail;
