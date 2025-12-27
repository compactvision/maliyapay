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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Coins,
    GraduationCap,
    LayoutDashboard,
    ListTodo,
    Sparkles,
    Target,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Step {
    id: string;
    title: string;
    description: string;
    completed?: boolean;
    level?: number;
    objective?: string;
    locked?: boolean;
    knowledge?: {
        title: string;
        description: string;
        topics: string[];
        images: string[];
    };
    actions?: {
        title: string;
        description: string;
        steps: string[];
    };
    costs?: Array<{
        amount: string;
        unit: string;
        description: string;
    }>;
    progression?: {
        xpReward: number;
        nextLevelUnlock: boolean;
    };
}

interface StepDetailProps {
    business: {
        id: string;
        title: string;
        steps: Step[];
    };
    stepId: string;
    [key: string]: any;
}

const QuestStepDetail = () => {
    const { business, stepId } = usePage<StepDetailProps>().props;
    const [activeTab, setActiveTab] = useState('briefing');

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

    const isCurrent =
        !step.completed &&
        (stepIndex === 0 || business.steps[stepIndex - 1].completed);

    const handleCompleteStep = async () => {
        try {
            await growthApi.updateBusinessProgress(business.id, step.id);
            toast.success('Niveau terminé ! Félicitations ! 🎉');
            router.visit('/growth?tab=business');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleBack = () => {
        router.visit('/growth?tab=business');
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/50">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="gap-2 pl-0 hover:bg-transparent hover:text-emerald-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">
                                Retour à la carte
                            </span>
                        </Button>
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-600"
                            >
                                Niveau {stepIndex + 1}
                            </Badge>
                            {step.completed && (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                    Terminé
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto max-w-5xl p-4 md:p-6">
                    {/* Hero Section */}
                    <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-8 text-white shadow-2xl md:p-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10"
                        >
                            <div className="mb-4 inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300 backdrop-blur-sm">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {business.title}
                            </div>
                            <h1 className="mb-4 text-3xl font-extrabold tracking-tight md:text-5xl">
                                {step.title}
                            </h1>
                            <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                                {step.description}
                            </p>
                        </motion.div>

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl filter" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl filter" />
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs
                        defaultValue="briefing"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-8"
                    >
                        <TabsList className="grid h-auto w-full grid-cols-3 gap-4 bg-transparent p-0">
                            {[
                                {
                                    id: 'briefing',
                                    label: 'Briefing',
                                    icon: LayoutDashboard,
                                },
                                {
                                    id: 'knowledge',
                                    label: 'Savoir',
                                    icon: GraduationCap,
                                },
                                {
                                    id: 'action',
                                    label: 'Action',
                                    icon: ListTodo,
                                },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border-2 border-transparent bg-white py-4 shadow-sm transition-all hover:border-emerald-500/20 hover:bg-emerald-50/50 data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50/50 data-[state=active]:shadow-md data-[state=active]:ring-primary/20 dark:bg-slate-900 dark:hover:bg-slate-800 dark:data-[state=active]:bg-slate-800"
                                >
                                    <div className="rounded-full bg-slate-100 p-3 transition-colors group-data-[state=active]:bg-emerald-500 group-data-[state=active]:text-white dark:bg-slate-800">
                                        <tab.icon className="h-6 w-6" />
                                    </div>
                                    <span className="font-semibold">
                                        {tab.label}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* TAB 1: BRIEFING */}
                                <TabsContent
                                    value="briefing"
                                    className="mt-0 space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Objective Card */}
                                        <Card className="border-l-4 border-l-emerald-500 shadow-md">
                                            <CardHeader>
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <Target className="h-6 w-6" />
                                                    <CardTitle>
                                                        Objectif Principal
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-lg text-slate-700 dark:text-slate-300">
                                                    {step.objective ||
                                                        'Compléter toutes les tâches pour valider ce niveau.'}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Rewards Card */}
                                        <Card className="border-l-4 border-l-amber-500 shadow-md">
                                            <CardHeader>
                                                <div className="flex items-center gap-2 text-amber-600">
                                                    <Trophy className="h-6 w-6" />
                                                    <CardTitle>
                                                        Récompenses
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-3">
                                                        <span className="font-medium text-amber-700 dark:text-amber-300">
                                                            Experience
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                                        >
                                                            +
                                                            {step.progression
                                                                ?.xpReward ||
                                                                100}{' '}
                                                            XP
                                                        </Badge>
                                                    </div>
                                                    {step.progression
                                                        ?.nextLevelUnlock && (
                                                        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-3">
                                                            <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                                                Débloque
                                                            </span>
                                                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                Niveau Suivant
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Costs Section if available */}
                                    {step.costs && step.costs.length > 0 && (
                                        <Card className="shadow-md">
                                            <CardHeader>
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <Coins className="h-6 w-6" />
                                                    <CardTitle>
                                                        Investissement Estimé
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {step.costs.map(
                                                        (cost, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex flex-col rounded-xl border bg-slate-50 p-4 dark:bg-slate-900"
                                                            >
                                                                <span className="text-2xl font-bold">
                                                                    {
                                                                        cost.amount
                                                                    }{' '}
                                                                    {cost.unit}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {
                                                                        cost.description
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* TAB 2: KNOWLEDGE */}
                                <TabsContent value="knowledge" className="mt-0">
                                    <div className="grid gap-8 lg:grid-cols-3">
                                        {/* Main Knowledge Content */}
                                        <div className="space-y-6 lg:col-span-2">
                                            <Card className="overflow-hidden shadow-lg">
                                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                            <BookOpen className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl">
                                                                {step.knowledge
                                                                    ?.title ||
                                                                    "Module d'apprentissage"}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Maîtrisez les
                                                                concepts clés
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                                        <p className="text-lg leading-relaxed">
                                                            {
                                                                step.knowledge
                                                                    ?.description
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Topics List */}
                                                    {step.knowledge?.topics &&
                                                        step.knowledge.topics
                                                            .length > 0 && (
                                                            <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
                                                                <h4 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
                                                                    Points clés
                                                                    à retenir :
                                                                </h4>
                                                                <ul className="space-y-3">
                                                                    {step.knowledge.topics.map(
                                                                        (
                                                                            topic,
                                                                            i,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="flex items-start gap-3"
                                                                            >
                                                                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                                                                <span>
                                                                                    {
                                                                                        topic
                                                                                    }
                                                                                </span>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Visuals / Images Sidebar */}
                                        <div className="space-y-6">
                                            {step.knowledge?.images &&
                                            step.knowledge.images.length > 0 ? (
                                                step.knowledge.images.map(
                                                    (img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg"
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`Illustration ${idx + 1}`}
                                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <Card className="flex h-64 flex-col items-center justify-center border-dashed p-6 text-center text-muted-foreground">
                                                    <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                                        <Sparkles className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <p>
                                                        Aucune illustration pour
                                                        ce module
                                                    </p>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 3: ACTION */}
                                <TabsContent value="action" className="mt-0">
                                    <div className="grid gap-8 lg:grid-cols-3">
                                        {/* Action Plan */}
                                        <div className="lg:col-span-2">
                                            <Card className="shadow-lg">
                                                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            <ListTodo className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl">
                                                                {step.actions
                                                                    ?.title ||
                                                                    "Plan d'action"}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Les étapes
                                                                concrètes à
                                                                réaliser
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="mb-6 text-slate-600 dark:text-slate-400">
                                                        {
                                                            step.actions
                                                                ?.description
                                                        }
                                                    </p>

                                                    {step.actions?.steps &&
                                                    step.actions.steps.length >
                                                        0 ? (
                                                        <div className="space-y-4">
                                                            {step.actions.steps.map(
                                                                (
                                                                    actionStep,
                                                                    i,
                                                                ) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        initial={{
                                                                            opacity: 0,
                                                                            x: -10,
                                                                        }}
                                                                        whileInView={{
                                                                            opacity: 1,
                                                                            x: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                i *
                                                                                0.1,
                                                                        }}
                                                                        className="flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900"
                                                                    >
                                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                                                            {i +
                                                                                1}
                                                                        </div>
                                                                        <div className="pt-1">
                                                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                                                {
                                                                                    actionStep
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="py-12 text-center text-muted-foreground">
                                                            Aucune étape
                                                            spécifique définie.
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Action Sidebar / CTA */}
                                        <div className="space-y-6">
                                            <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">
                                                        Prêt à valider ?
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Une fois toutes les
                                                        actions réalisées,
                                                        marquez ce niveau comme
                                                        terminé.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button
                                                        onClick={
                                                            handleCompleteStep
                                                        }
                                                        size="lg"
                                                        className="w-full bg-emerald-600 text-lg font-bold shadow-lg hover:bg-emerald-700 hover:shadow-emerald-500/25"
                                                        disabled={
                                                            step.completed
                                                        }
                                                    >
                                                        {step.completed ? (
                                                            <>
                                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                                Niveau validé
                                                            </>
                                                        ) : (
                                                            'Terminer le niveau'
                                                        )}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
};

export default QuestStepDetail;
