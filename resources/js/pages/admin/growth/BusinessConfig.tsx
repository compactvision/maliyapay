// fichier: resources/js/Pages/Admin/Growth/BusinessConfig.tsx
import { growthApi } from '@/api/growthApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    BarChart3,
    BookOpen,
    Briefcase,
    Calculator,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    CloudRain,
    Coins,
    DollarSign,
    Download,
    Droplets,
    Eye,
    FileText,
    Globe,
    Image as ImageIcon,
    Moon,
    Package,
    Pause,
    Plus,
    Rocket,
    Save,
    Sun,
    Target,
    Trash2,
    Trophy,
    Upload,
    Users,
    Wheat,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface CostItem {
    id: string;
    name: string;
    amount: number;
    unit: string;
    category: 'tools' | 'seeds' | 'fertilizers' | 'labor' | 'water' | 'other';
    recurring: boolean;
    frequency?: 'weekly' | 'monthly' | 'seasonally' | 'yearly';
}

interface RoutineTask {
    id: string;
    title: string;
    description: string;
    time: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonally';
    completed: boolean;
}

interface JourneyStep {
    id: string;
    level: number;
    title: string;
    objective: string;
    description: string;
    knowledge: {
        title: string;
        content: string[];
        images: File[];
    };
    actions: {
        title: string;
        description: string;
        steps: string[];
        tools: string[];
        duration: string;
    };
    costs: CostItem[];
    routines: RoutineTask[];
    progression: {
        xpReward: number;
        validationCriteria: string[];
        nextLevelUnlock: boolean;
    };
    locked: boolean;
    completed: boolean;
    isPaid?: boolean;
    priceAmount?: number;
    tasksCount?: number;
    importsCount?: number;
}

interface CropJourney {
    id: string;
    name: string;
    description: string;
    icon: string;
    image: File | null;
    season: string;
    cycleDuration: string;
    soilTypes: string[];
    yieldPotential: string;
    mainRisks: string[];
    sector: string;
    views?: number;
    shares?: number;
    engagement?: number;
    growth?: number;
    players?: number;
    businessPlan: {
        estimatedInvestment: number;
        expectedRevenue: number;
        profitMargin: number;
        roi: number;
        paybackPeriod: string;
    };
    steps: JourneyStep[];
}

interface PageProps {
    item: CropJourney;
}

const BusinessConfig = ({ item: propItem }: { item?: CropJourney }) => {
    const { props } = usePage<any>();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState<
        'overview' | 'intro' | 'steps' | 'business'
    >('overview');
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // Resolve item from props or usePage
    const resolveItem = () => {
        if (propItem) return propItem;
        if (props.item) {
            return typeof props.item === 'string'
                ? JSON.parse(props.item)
                : props.item;
        }
        return null;
    };

    const [selectedItem] = useState<CropJourney | null>(resolveItem());

    const [cropJourney, setCropJourney] = useState<CropJourney>({
        id: selectedItem?.id || Date.now().toString(),
        name: selectedItem?.name || '',
        description: selectedItem?.description || '',
        icon: selectedItem?.icon || 'Briefcase',
        image: selectedItem?.image || null,
        season: selectedItem?.season || '',
        cycleDuration: selectedItem?.cycleDuration || '',
        soilTypes: selectedItem?.soilTypes || [],
        yieldPotential: selectedItem?.yieldPotential || '',
        mainRisks: selectedItem?.mainRisks || [],
        sector: selectedItem?.sector || 'Général',
        businessPlan: {
            estimatedInvestment:
                selectedItem?.businessPlan?.estimatedInvestment || 0,
            expectedRevenue: selectedItem?.businessPlan?.expectedRevenue || 0,
            profitMargin: selectedItem?.businessPlan?.profitMargin || 0,
            roi: selectedItem?.businessPlan?.roi || 0,
            paybackPeriod: selectedItem?.businessPlan?.paybackPeriod || '',
        },
        steps: (selectedItem?.steps || []).map((step: any) => ({
            ...step,
            knowledge: {
                title: step.knowledge?.title || '',
                content: step.knowledge?.content || [],
                images: step.knowledge?.images || [],
            },
            actions: {
                title: step.actions?.title || '',
                description: step.actions?.description || '',
                steps: step.actions?.steps || [],
                tools: step.actions?.tools || [],
                duration: step.actions?.duration || '',
            },
            costs: step.costs || [],
            routines: step.routines || [],
            progression: {
                xpReward: step.progression?.xpReward || 100,
                validationCriteria: step.progression?.validationCriteria || [],
                nextLevelUnlock: step.progression?.nextLevelUnlock ?? true,
            },
            locked: step.locked ?? false,
            completed: step.completed ?? false,
        })),
    });

    useEffect(() => {
        const isDark =
            localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    const handleConfigSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const steps = cropJourney.steps.map((step, index) => ({
                id: step.id,
                title: step.title,
                description: step.description,
                order_index: index,
                level: step.level,
                objective: step.objective,
                knowledge: step.knowledge,
                actions: step.actions,
                costs: step.costs,
                routines: step.routines,
                progression: step.progression,
                locked: step.locked,
                is_paid: step.isPaid,
                price_amount: step.priceAmount,
            }));

            const formData = new FormData();
            formData.append('title', cropJourney.name);
            formData.append('description', cropJourney.description);
            formData.append('icon', cropJourney.icon);
            formData.append('difficulty', 'medium');
            formData.append('potential', 'high');
            formData.append('sector', cropJourney.sector);
            formData.append('season', cropJourney.season);
            formData.append('cycle_duration', cropJourney.cycleDuration);
            formData.append(
                'soil_types',
                JSON.stringify(cropJourney.soilTypes),
            );
            formData.append('yield_potential', cropJourney.yieldPotential);
            formData.append(
                'main_risks',
                JSON.stringify(cropJourney.mainRisks),
            );
            formData.append(
                'business_plan',
                JSON.stringify(cropJourney.businessPlan),
            );

            // Send steps as array items for FormData
            steps.forEach((step, index) => {
                formData.append(`steps[${index}][id]`, step.id);
                formData.append(`steps[${index}][title]`, step.title);
                formData.append(
                    `steps[${index}][description]`,
                    step.description || '',
                );
                formData.append(
                    `steps[${index}][order_index]`,
                    index.toString(),
                );
                formData.append(
                    `steps[${index}][level]`,
                    step.level.toString(),
                );
                formData.append(
                    `steps[${index}][objective]`,
                    step.objective || '',
                );

                if (step.is_paid !== undefined) {
                    formData.append(
                        `steps[${index}][is_paid]`,
                        step.is_paid ? '1' : '0',
                    );
                }
                if (
                    step.price_amount !== undefined &&
                    step.price_amount !== null
                ) {
                    formData.append(
                        `steps[${index}][price_amount]`,
                        step.price_amount.toString(),
                    );
                }

                // Send complex nested data as JSON strings
                formData.append(
                    `steps[${index}][knowledge]`,
                    JSON.stringify(step.knowledge),
                );
                formData.append(
                    `steps[${index}][actions]`,
                    JSON.stringify(step.actions),
                );
                formData.append(
                    `steps[${index}][costs]`,
                    JSON.stringify(step.costs),
                );
                formData.append(
                    `steps[${index}][routines]`,
                    JSON.stringify(step.routines),
                );
                formData.append(
                    `steps[${index}][progression]`,
                    JSON.stringify(step.progression),
                );
                formData.append(
                    `steps[${index}][locked]`,
                    step.locked ? '1' : '0',
                );
            });

            if (cropJourney.image instanceof File) {
                formData.append('image', cropJourney.image);
            } else if (typeof cropJourney.image === 'string') {
                formData.append('existing_image', cropJourney.image);
            }

            if (selectedItem?.id) {
                await growthApi.updateBusinessModel(selectedItem.id, formData);
                toast.success(
                    'Configuration du business mise à jour avec succès',
                    {
                        icon: <Rocket className="h-4 w-4 text-green-500" />,
                    },
                );
            } else {
                await growthApi.createBusinessModel(formData);
                toast.success('Business créé avec succès');
            }

            setTimeout(() => {
                router.visit('/admin/growth');
            }, 1500);
        } catch (err) {
            console.error('Error submitting config:', err);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCropJourney((prev) => ({
                ...prev,
                image: e.target.files![0],
            }));
        }
    };

    const addCostItem = (stepId: string) => {
        const newCostItem: CostItem = {
            id: Date.now().toString(),
            name: '',
            amount: 0,
            unit: '',
            category: 'other',
            recurring: false,
        };

        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? { ...step, costs: [...step.costs, newCostItem] }
                    : step,
            ),
        }));
    };

    const updateCostItem = (
        stepId: string,
        costId: string,
        field: keyof CostItem,
        value: any,
    ) => {
        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? {
                          ...step,
                          costs: step.costs.map((cost) =>
                              cost.id === costId
                                  ? { ...cost, [field]: value }
                                  : cost,
                          ),
                      }
                    : step,
            ),
        }));
    };

    const removeCostItem = (stepId: string, costId: string) => {
        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? {
                          ...step,
                          costs: step.costs.filter(
                              (cost) => cost.id !== costId,
                          ),
                      }
                    : step,
            ),
        }));
    };

    const addRoutineTask = (stepId: string) => {
        const newTask: RoutineTask = {
            id: Date.now().toString(),
            title: '',
            description: '',
            time: '09:00',
            frequency: 'daily',
            completed: false,
        };

        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? { ...step, routines: [...step.routines, newTask] }
                    : step,
            ),
        }));
    };

    const updateRoutineTask = (
        stepId: string,
        taskId: string,
        field: keyof RoutineTask,
        value: any,
    ) => {
        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? {
                          ...step,
                          routines: step.routines.map((task) =>
                              task.id === taskId
                                  ? { ...task, [field]: value }
                                  : task,
                          ),
                      }
                    : step,
            ),
        }));
    };

    const removeRoutineTask = (stepId: string, taskId: string) => {
        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? {
                          ...step,
                          routines: step.routines.filter(
                              (task) => task.id !== taskId,
                          ),
                      }
                    : step,
            ),
        }));
    };

    const calculateTotalCosts = () => {
        let totalOneTime = 0;
        let totalRecurring = 0;

        cropJourney.steps.forEach((step) => {
            step.costs.forEach((cost) => {
                if (cost.recurring) {
                    totalRecurring += cost.amount;
                } else {
                    totalOneTime += cost.amount;
                }
            });
        });

        return {
            totalOneTime,
            totalRecurring,
            total: totalOneTime + totalRecurring,
        };
    };

    // Step Management Functions
    const createNewStep = () => {
        const newStep: JourneyStep = {
            id: Date.now().toString(),
            level: cropJourney.steps.length + 1,
            title: `Niveau ${cropJourney.steps.length + 1}`,
            objective: '',
            description: '',
            knowledge: {
                title: '',
                content: [],
                images: [],
            },
            actions: {
                title: '',
                description: '',
                steps: [],
                tools: [],
                duration: '',
            },
            costs: [],
            routines: [],
            progression: {
                xpReward: 100,
                validationCriteria: [],
                nextLevelUnlock: true,
            },
            locked: false,
            completed: false,
        };

        setCropJourney((prev) => ({
            ...prev,
            steps: [...prev.steps, newStep],
        }));

        toast.success('Nouvelle étape créée', {
            icon: <Plus className="h-4 w-4 text-green-500" />,
        });
    };

    const deleteStep = (stepId: string) => {
        if (cropJourney.steps.length <= 1) {
            toast.error('Impossible de supprimer la dernière étape');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
            setCropJourney((prev) => ({
                ...prev,
                steps: prev.steps
                    .filter((step) => step.id !== stepId)
                    .map((step, index) => ({
                        ...step,
                        level: index + 1,
                    })),
            }));

            toast.success('Étape supprimée', {
                icon: <Trash2 className="h-4 w-4 text-red-500" />,
            });
        }
    };

    const moveStepUp = (index: number) => {
        if (index === 0) return;

        const newSteps = [...cropJourney.steps];
        [newSteps[index - 1], newSteps[index]] = [
            newSteps[index],
            newSteps[index - 1],
        ];

        // Update levels
        newSteps.forEach((step, idx) => {
            step.level = idx + 1;
        });

        setCropJourney((prev) => ({ ...prev, steps: newSteps }));
    };

    const moveStepDown = (index: number) => {
        if (index === cropJourney.steps.length - 1) return;

        const newSteps = [...cropJourney.steps];
        [newSteps[index], newSteps[index + 1]] = [
            newSteps[index + 1],
            newSteps[index],
        ];

        // Update levels
        newSteps.forEach((step, idx) => {
            step.level = idx + 1;
        });

        setCropJourney((prev) => ({ ...prev, steps: newSteps }));
    };

    const duplicateStep = (stepId: string) => {
        const stepToDuplicate = cropJourney.steps.find((s) => s.id === stepId);
        if (!stepToDuplicate) return;

        const duplicatedStep: JourneyStep = {
            ...stepToDuplicate,
            id: Date.now().toString(),
            level: cropJourney.steps.length + 1,
            title: `${stepToDuplicate.title} (Copie)`,
            completed: false,
        };

        setCropJourney((prev) => ({
            ...prev,
            steps: [...prev.steps, duplicatedStep],
        }));

        toast.success('Étape dupliquée', {
            icon: <Plus className="h-4 w-4 text-blue-500" />,
        });
    };

    const handleKnowledgeImageUpload = (
        stepId: string,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setCropJourney((prev) => ({
                ...prev,
                steps: prev.steps.map((step) =>
                    step.id === stepId
                        ? {
                              ...step,
                              knowledge: {
                                  ...step.knowledge,
                                  images: [...step.knowledge.images, ...files],
                              },
                          }
                        : step,
                ),
            }));

            toast.success(`${files.length} image(s) ajoutée(s)`, {
                icon: <ImageIcon className="h-4 w-4 text-blue-500" />,
            });
        }
    };

    const removeKnowledgeImage = (stepId: string, imageIndex: number) => {
        setCropJourney((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
                step.id === stepId
                    ? {
                          ...step,
                          knowledge: {
                              ...step.knowledge,
                              images: step.knowledge.images.filter(
                                  (_, idx) => idx !== imageIndex,
                              ),
                          },
                      }
                    : step,
            ),
        }));
    };

    const calculateTotalXP = () => {
        return cropJourney.steps.reduce(
            (total, step) => total + step.progression.xpReward,
            0,
        );
    };

    const getCompletedSteps = () => {
        return cropJourney.steps.filter((step) => step.completed).length;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'draft':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'archived':
                return <Pause className="h-4 w-4 text-gray-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'tools':
                return <Wrench className="h-4 w-4" />;
            case 'seeds':
                return <Wheat className="h-4 w-4" />;
            case 'fertilizers':
                return <Droplets className="h-4 w-4" />;
            case 'labor':
                return <Users className="h-4 w-4" />;
            case 'water':
                return <Droplets className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return 'Quotidien';
            case 'weekly':
                return 'Hebdomadaire';
            case 'monthly':
                return 'Mensuel';
            case 'seasonally':
                return 'Saisonnier';
            case 'yearly':
                return 'Annuel';
            default:
                return frequency;
        }
    };

    const downloadBusinessPlan = () => {
        // Simuler le téléchargement du business plan
        toast.success('Business Plan téléchargé avec succès', {
            icon: <Download className="h-4 w-4 text-green-500" />,
        });
    };

    return (
        <AppLayout>
            <Head title={`Configuration - ${cropJourney.name}`} />
            <Toaster
                position="top-right"
                theme={isDarkMode ? 'dark' : 'light'}
                className="dark:border-gray-700 dark:bg-gray-800"
            />

            <div
                className={`fixed inset-0 -z-10 transition-all duration-500 ${
                    isDarkMode
                        ? 'bg-gradient-to-br from-gray-900 via-orange-900/20 to-red-900/20'
                        : 'bg-gradient-to-br from-slate-50 via-orange-50 to-red-50'
                }`}
            />

            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-2xl p-8 shadow-xl transition-all duration-500 ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800/90 backdrop-blur-sm'
                            : 'bg-white/80 backdrop-blur-sm'
                    }`}
                >
                    <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                            isDarkMode
                                ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20'
                                : 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
                        }`}
                    />
                    <div className="relative z-10">
                        <div className="mb-6 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/growth')}
                                className={`flex items-center gap-2 ${
                                    isDarkMode
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour à la liste
                            </Button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleDarkMode}
                                className={`rounded-full p-3 transition-all duration-300 ${
                                    isDarkMode
                                        ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </motion.button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-4 shadow-lg">
                                <Briefcase className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1
                                    className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    {cropJourney.name}
                                </h1>
                                <p
                                    className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                >
                                    Configuration de la Business Quest
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`overflow-hidden rounded-xl shadow-lg ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800/90'
                            : 'bg-white/80'
                    }`}
                >
                    <div className="flex flex-wrap">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`min-w-[120px] flex-1 px-4 py-3 font-medium transition-colors ${
                                activeTab === 'overview'
                                    ? 'bg-orange-500 text-white'
                                    : isDarkMode
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Aperçu
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('intro')}
                            className={`min-w-[120px] flex-1 px-4 py-3 font-medium transition-colors ${
                                activeTab === 'intro'
                                    ? 'bg-orange-500 text-white'
                                    : isDarkMode
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Introduction
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('steps')}
                            className={`min-w-[120px] flex-1 px-4 py-3 font-medium transition-colors ${
                                activeTab === 'steps'
                                    ? 'bg-orange-500 text-white'
                                    : isDarkMode
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Target className="h-4 w-4" />
                                Étapes ({cropJourney.steps.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`min-w-[120px] flex-1 px-4 py-3 font-medium transition-colors ${
                                activeTab === 'business'
                                    ? 'bg-orange-500 text-white'
                                    : isDarkMode
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FileText className="h-4 w-4" />
                                Business Plan
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Stats Overview */}
                            <div
                                className={`grid grid-cols-2 gap-4 rounded-2xl p-6 md:grid-cols-4 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="mb-2 flex items-center justify-center gap-2 text-orange-500">
                                        <Eye className="h-5 w-5" />
                                        <span className="text-2xl font-bold">
                                            {selectedItem?.views || 0}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Vues
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex items-center justify-center gap-2 text-green-500">
                                        <Users className="h-5 w-5" />
                                        <span className="text-2xl font-bold">
                                            {selectedItem?.players || 0}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Joueurs
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex items-center justify-center gap-2 text-purple-500">
                                        <Zap className="h-5 w-5" />
                                        <span className="text-2xl font-bold">
                                            {calculateTotalXP()}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        XP Total
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex items-center justify-center gap-2 text-yellow-500">
                                        <Trophy className="h-5 w-5" />
                                        <span className="text-2xl font-bold">
                                            {getCompletedSteps()}/
                                            {cropJourney.steps.length}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Étapes complétées
                                    </p>
                                </div>
                            </div>

                            {/* Progress Overview */}
                            <div
                                className={`rounded-2xl p-6 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <h3
                                    className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Progression de l'aventure
                                </h3>
                                <div className="space-y-4">
                                    {cropJourney.steps.map((step) => (
                                        <div
                                            key={step.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                                                    step.completed
                                                        ? 'bg-green-500'
                                                        : step.locked
                                                          ? 'bg-gray-500'
                                                          : 'bg-orange-500'
                                                }`}
                                            >
                                                {step.completed ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    step.level
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <h4
                                                        className={`font-medium ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {step.title}
                                                    </h4>
                                                    <span
                                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                                    >
                                                        {
                                                            step.progression
                                                                .xpReward
                                                        }{' '}
                                                        XP
                                                    </span>
                                                </div>
                                                <div
                                                    className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                                                >
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            step.completed
                                                                ? 'bg-green-500'
                                                                : step.locked
                                                                  ? 'bg-gray-500'
                                                                  : 'bg-orange-500'
                                                        }`}
                                                        style={{
                                                            width: step.completed
                                                                ? '100%'
                                                                : step.locked
                                                                  ? '0%'
                                                                  : '50%',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cost Overview */}
                            <div
                                className={`rounded-2xl p-6 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <h3
                                    className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Aperçu des coûts
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div
                                        className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-blue-500" />
                                            <span
                                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                            >
                                                Coûts uniques
                                            </span>
                                        </div>
                                        <p
                                            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            {calculateTotalCosts().totalOneTime.toLocaleString()}{' '}
                                            €
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-green-500" />
                                            <span
                                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                            >
                                                Coûts récurrents
                                            </span>
                                        </div>
                                        <p
                                            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            {calculateTotalCosts().totalRecurring.toLocaleString()}{' '}
                                            €
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calculator className="h-5 w-5 text-purple-500" />
                                            <span
                                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                            >
                                                Coût total
                                            </span>
                                        </div>
                                        <p
                                            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            {calculateTotalCosts().total.toLocaleString()}{' '}
                                            €
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Introduction Tab */}
                    {activeTab === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div
                                className={`rounded-2xl p-6 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <h3
                                    className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Informations générales
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Nom de l'aventure
                                            </Label>
                                            <Input
                                                value={cropJourney.name}
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Description
                                            </Label>
                                            <Textarea
                                                value={cropJourney.description}
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={4}
                                                className={`resize-none transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Icône
                                            </Label>
                                            <select
                                                value={cropJourney.icon}
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        icon: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            >
                                                <option value="Wheat">
                                                    Maïs
                                                </option>
                                                <option value="TreePine">
                                                    Arbre
                                                </option>
                                                <option value="Leaf">
                                                    Feuille
                                                </option>
                                                <option value="Droplets">
                                                    Gouttes
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Secteur d'activité
                                            </Label>
                                            <div className="relative">
                                                <Globe className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                                <Input
                                                    value={cropJourney.sector}
                                                    onChange={(e) =>
                                                        setCropJourney({
                                                            ...cropJourney,
                                                            sector: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className={`pl-10 transition-colors focus:ring-2 focus:ring-green-500 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                            : ''
                                                    }`}
                                                    placeholder="ex: Agriculture, Élevage..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Saison idéale
                                            </Label>
                                            <div className="relative">
                                                <CloudRain className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                                <Input
                                                    value={cropJourney.season}
                                                    onChange={(e) =>
                                                        setCropJourney({
                                                            ...cropJourney,
                                                            season: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className={`pl-10 transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                            : ''
                                                    }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    className={
                                                        isDarkMode
                                                            ? 'text-gray-300'
                                                            : ''
                                                    }
                                                >
                                                    Durée du cycle
                                                </Label>
                                                <Input
                                                    value={
                                                        cropJourney.cycleDuration
                                                    }
                                                    onChange={(e) =>
                                                        setCropJourney({
                                                            ...cropJourney,
                                                            cycleDuration:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                            : ''
                                                    }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    className={
                                                        isDarkMode
                                                            ? 'text-gray-300'
                                                            : ''
                                                    }
                                                >
                                                    Potentiel de rendement
                                                </Label>
                                                <Input
                                                    value={
                                                        cropJourney.yieldPotential
                                                    }
                                                    onChange={(e) =>
                                                        setCropJourney({
                                                            ...cropJourney,
                                                            yieldPotential:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                            : ''
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Types de sols adaptés
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Argileux',
                                                'Limoneux',
                                                'Sableux',
                                                'Calcaire',
                                                'Humifère',
                                            ].map((soil) => (
                                                <button
                                                    key={soil}
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            cropJourney.soilTypes.includes(
                                                                soil,
                                                            )
                                                        ) {
                                                            setCropJourney({
                                                                ...cropJourney,
                                                                soilTypes:
                                                                    cropJourney.soilTypes.filter(
                                                                        (s) =>
                                                                            s !==
                                                                            soil,
                                                                    ),
                                                            });
                                                        } else {
                                                            setCropJourney({
                                                                ...cropJourney,
                                                                soilTypes: [
                                                                    ...cropJourney.soilTypes,
                                                                    soil,
                                                                ],
                                                            });
                                                        }
                                                    }}
                                                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                                        cropJourney.soilTypes.includes(
                                                            soil,
                                                        )
                                                            ? 'bg-orange-500 text-white'
                                                            : isDarkMode
                                                              ? 'bg-gray-700 text-gray-300'
                                                              : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {soil}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Risques principaux
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Sécheresse',
                                                'Maladies',
                                                'Ravageurs',
                                                'Inondations',
                                                'Vent fort',
                                            ].map((risk) => (
                                                <button
                                                    key={risk}
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            cropJourney.mainRisks.includes(
                                                                risk,
                                                            )
                                                        ) {
                                                            setCropJourney({
                                                                ...cropJourney,
                                                                mainRisks:
                                                                    cropJourney.mainRisks.filter(
                                                                        (r) =>
                                                                            r !==
                                                                            risk,
                                                                    ),
                                                            });
                                                        } else {
                                                            setCropJourney({
                                                                ...cropJourney,
                                                                mainRisks: [
                                                                    ...cropJourney.mainRisks,
                                                                    risk,
                                                                ],
                                                            });
                                                        }
                                                    }}
                                                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                                        cropJourney.mainRisks.includes(
                                                            risk,
                                                        )
                                                            ? 'bg-red-500 text-white'
                                                            : isDarkMode
                                                              ? 'bg-gray-700 text-gray-300'
                                                              : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {risk}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div
                                        className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-xl p-8 text-center`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="journey-image-upload"
                                        />
                                        <label
                                            htmlFor="journey-image-upload"
                                            className={`inline-flex cursor-pointer items-center gap-3 rounded-lg px-6 py-3 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                            } transition-colors`}
                                        >
                                            <Upload className="h-5 w-5" />
                                            Ajouter une image d'illustration
                                        </label>
                                        <p
                                            className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                        >
                                            PNG, JPG jusqu'à 10MB
                                        </p>
                                    </div>

                                    {cropJourney.image && (
                                        <div className="group relative mt-6">
                                            <img
                                                src={
                                                    cropJourney.image instanceof
                                                    File
                                                        ? URL.createObjectURL(
                                                              cropJourney.image,
                                                          )
                                                        : cropJourney.image
                                                }
                                                alt="Journey preview"
                                                className="h-48 w-full rounded-xl object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        image: null,
                                                    })
                                                }
                                                className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Steps Tab */}
                    {activeTab === 'steps' && (
                        <motion.div
                            key="steps"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Create New Step Button */}
                            <div
                                className={`rounded-2xl p-6 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3
                                            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            Gestion des étapes
                                        </h3>
                                        <p
                                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                        >
                                            {cropJourney.steps.length} étape(s)
                                            configurée(s)
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={createNewStep}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer une nouvelle étape
                                    </Button>
                                </div>
                            </div>

                            {cropJourney.steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`overflow-hidden rounded-2xl shadow-lg ${
                                        isDarkMode
                                            ? 'border border-gray-700 bg-gray-800/90'
                                            : 'bg-white/80'
                                    }`}
                                >
                                    <div
                                        className={`cursor-pointer p-6 transition-colors ${
                                            isDarkMode
                                                ? 'hover:bg-gray-700/50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="flex flex-1 items-center gap-4"
                                                onClick={() =>
                                                    setExpandedStep(
                                                        expandedStep === index
                                                            ? null
                                                            : index,
                                                    )
                                                }
                                            >
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${
                                                        step.completed
                                                            ? 'bg-green-500'
                                                            : step.locked
                                                              ? 'bg-gray-500'
                                                              : 'bg-orange-500'
                                                    }`}
                                                >
                                                    {step.completed ? (
                                                        <CheckCircle className="h-6 w-6" />
                                                    ) : (
                                                        step.level
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3
                                                        className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        Niveau {step.level}:{' '}
                                                        {step.title}
                                                    </h3>
                                                    <p
                                                        className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                                    >
                                                        {step.objective}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Move Up Button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveStepUp(index);
                                                    }}
                                                    disabled={index === 0}
                                                    className={`${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                                                    title="Monter"
                                                >
                                                    <ChevronDown className="h-4 w-4 rotate-180" />
                                                </Button>

                                                {/* Move Down Button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveStepDown(index);
                                                    }}
                                                    disabled={
                                                        index ===
                                                        cropJourney.steps
                                                            .length -
                                                            1
                                                    }
                                                    className={`${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                                                    title="Descendre"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>

                                                {/* Duplicate Button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateStep(step.id);
                                                    }}
                                                    className={`${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                                                    title="Dupliquer"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteStep(step.id);
                                                    }}
                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                        step.completed
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : step.locked
                                                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}
                                                >
                                                    {step.completed
                                                        ? 'Complété'
                                                        : step.locked
                                                          ? 'Verrouillé'
                                                          : 'Disponible'}
                                                </span>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 text-gray-300'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {step.progression.xpReward}{' '}
                                                    XP
                                                </span>
                                                <motion.div
                                                    animate={{
                                                        rotate:
                                                            expandedStep ===
                                                            index
                                                                ? 180
                                                                : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    onClick={() =>
                                                        setExpandedStep(
                                                            expandedStep ===
                                                                index
                                                                ? null
                                                                : index,
                                                        )
                                                    }
                                                >
                                                    <ChevronDown
                                                        className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                    />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedStep === index && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: 'auto',
                                                    opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div
                                                    className={`border-t p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                                >
                                                    {/* Step Metadata */}
                                                    <div className="mb-6 space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                >
                                                                    Titre de
                                                                    l'étape
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        step.title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].title =
                                                                            e.target.value;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className={`font-medium transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                    placeholder="Ex: Découverte du Maïs"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                >
                                                                    Objectif
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        step.objective
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].objective =
                                                                            e.target.value;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                    placeholder="Ex: Comprendre les bases de la culture"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}
                                                            >
                                                                Description
                                                            </Label>
                                                            <Textarea
                                                                value={
                                                                    step.description
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newSteps =
                                                                        [
                                                                            ...cropJourney.steps,
                                                                        ];
                                                                    newSteps[
                                                                        index
                                                                    ].description =
                                                                        e.target.value;
                                                                    setCropJourney(
                                                                        {
                                                                            ...cropJourney,
                                                                            steps: newSteps,
                                                                        },
                                                                    );
                                                                }}
                                                                rows={2}
                                                                className={`resize-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                                    isDarkMode
                                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                                        : ''
                                                                }`}
                                                                placeholder="Description détaillée de cette étape..."
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                                        {/* Knowledge Section */}
                                                        <div className="space-y-4">
                                                            <h4
                                                                className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                <BookOpen className="h-5 w-5 text-blue-500" />
                                                                Savoirs
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Titre
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        step
                                                                            .knowledge
                                                                            .title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].knowledge.title =
                                                                            e.target.value;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Contenu
                                                                </Label>
                                                                <div className="space-y-2">
                                                                    {(
                                                                        step
                                                                            .knowledge
                                                                            ?.content ||
                                                                        []
                                                                    ).map(
                                                                        (
                                                                            item,
                                                                            itemIndex,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    itemIndex
                                                                                }
                                                                                className="flex gap-2"
                                                                            >
                                                                                <Input
                                                                                    value={
                                                                                        item
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newSteps =
                                                                                            [
                                                                                                ...cropJourney.steps,
                                                                                            ];
                                                                                        newSteps[
                                                                                            index
                                                                                        ].knowledge.content[
                                                                                            itemIndex
                                                                                        ] =
                                                                                            e.target.value;
                                                                                        setCropJourney(
                                                                                            {
                                                                                                ...cropJourney,
                                                                                                steps: newSteps,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    className={`flex-1 transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                                                        isDarkMode
                                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                                            : ''
                                                                                    }`}
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newSteps =
                                                                                            [
                                                                                                ...cropJourney.steps,
                                                                                            ];
                                                                                        newSteps[
                                                                                            index
                                                                                        ].knowledge.content =
                                                                                            step.knowledge.content.filter(
                                                                                                (
                                                                                                    _,
                                                                                                    i,
                                                                                                ) =>
                                                                                                    i !==
                                                                                                    itemIndex,
                                                                                            );
                                                                                        setCropJourney(
                                                                                            {
                                                                                                ...cropJourney,
                                                                                                steps: newSteps,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newSteps =
                                                                                [
                                                                                    ...cropJourney.steps,
                                                                                ];
                                                                            newSteps[
                                                                                index
                                                                            ].knowledge.content.push(
                                                                                '',
                                                                            );
                                                                            setCropJourney(
                                                                                {
                                                                                    ...cropJourney,
                                                                                    steps: newSteps,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Ajouter
                                                                        un point
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Knowledge Images Upload */}
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Images
                                                                    illustratives
                                                                </Label>
                                                                <div
                                                                    className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4`}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleKnowledgeImageUpload(
                                                                                step.id,
                                                                                e,
                                                                            )
                                                                        }
                                                                        className="hidden"
                                                                        id={`knowledge-image-${step.id}`}
                                                                    />
                                                                    <label
                                                                        htmlFor={`knowledge-image-${step.id}`}
                                                                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg px-4 py-3 transition-colors ${
                                                                            isDarkMode
                                                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        <Upload className="h-5 w-5" />
                                                                        <span className="text-sm">
                                                                            Ajouter
                                                                            des
                                                                            images
                                                                        </span>
                                                                    </label>
                                                                    {step
                                                                        .knowledge
                                                                        .images
                                                                        .length >
                                                                        0 && (
                                                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                                                            {(
                                                                                step
                                                                                    .knowledge
                                                                                    ?.images ||
                                                                                []
                                                                            ).map(
                                                                                (
                                                                                    img,
                                                                                    imgIdx,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            imgIdx
                                                                                        }
                                                                                        className="group relative"
                                                                                    >
                                                                                        <img
                                                                                            src={
                                                                                                img instanceof
                                                                                                File
                                                                                                    ? URL.createObjectURL(
                                                                                                          img,
                                                                                                      )
                                                                                                    : img
                                                                                            }
                                                                                            alt={`Knowledge ${imgIdx + 1}`}
                                                                                            className="h-24 w-full rounded-lg object-cover"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                removeKnowledgeImage(
                                                                                                    step.id,
                                                                                                    imgIdx,
                                                                                                )
                                                                                            }
                                                                                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                                                        >
                                                                                            <X className="h-3 w-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions Section */}
                                                        <div className="space-y-4">
                                                            <h4
                                                                className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                <Target className="h-5 w-5 text-green-500" />
                                                                Actions
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Titre
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        step
                                                                            .actions
                                                                            .title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].actions.title =
                                                                            e.target.value;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className={`transition-colors focus:ring-2 focus:ring-green-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Description
                                                                </Label>
                                                                <Textarea
                                                                    value={
                                                                        step
                                                                            .actions
                                                                            .description
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].actions.description =
                                                                            e.target.value;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    rows={3}
                                                                    className={`resize-none transition-colors focus:ring-2 focus:ring-green-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    Étapes
                                                                </Label>
                                                                <div className="space-y-2">
                                                                    {(
                                                                        step
                                                                            .actions
                                                                            ?.steps ||
                                                                        []
                                                                    ).map(
                                                                        (
                                                                            item,
                                                                            itemIndex,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    itemIndex
                                                                                }
                                                                                className="flex gap-2"
                                                                            >
                                                                                <Input
                                                                                    value={
                                                                                        item
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newSteps =
                                                                                            [
                                                                                                ...cropJourney.steps,
                                                                                            ];
                                                                                        newSteps[
                                                                                            index
                                                                                        ].actions.steps[
                                                                                            itemIndex
                                                                                        ] =
                                                                                            e.target.value;
                                                                                        setCropJourney(
                                                                                            {
                                                                                                ...cropJourney,
                                                                                                steps: newSteps,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    className={`flex-1 transition-colors focus:ring-2 focus:ring-green-500 ${
                                                                                        isDarkMode
                                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                                            : ''
                                                                                    }`}
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newSteps =
                                                                                            [
                                                                                                ...cropJourney.steps,
                                                                                            ];
                                                                                        newSteps[
                                                                                            index
                                                                                        ].actions.steps =
                                                                                            step.actions.steps.filter(
                                                                                                (
                                                                                                    _,
                                                                                                    i,
                                                                                                ) =>
                                                                                                    i !==
                                                                                                    itemIndex,
                                                                                            );
                                                                                        setCropJourney(
                                                                                            {
                                                                                                ...cropJourney,
                                                                                                steps: newSteps,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newSteps =
                                                                                [
                                                                                    ...cropJourney.steps,
                                                                                ];
                                                                            newSteps[
                                                                                index
                                                                            ].actions.steps.push(
                                                                                '',
                                                                            );
                                                                            setCropJourney(
                                                                                {
                                                                                    ...cropJourney,
                                                                                    steps: newSteps,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Ajouter
                                                                        une
                                                                        étape
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        className={
                                                                            isDarkMode
                                                                                ? 'text-gray-300'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        Outils
                                                                    </Label>
                                                                    <Input
                                                                        value={step.actions.tools.join(
                                                                            ', ',
                                                                        )}
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newSteps =
                                                                                [
                                                                                    ...cropJourney.steps,
                                                                                ];
                                                                            newSteps[
                                                                                index
                                                                            ].actions.tools =
                                                                                e.target.value
                                                                                    .split(
                                                                                        ', ',
                                                                                    )
                                                                                    .filter(
                                                                                        (
                                                                                            t,
                                                                                        ) =>
                                                                                            t.trim(),
                                                                                    );
                                                                            setCropJourney(
                                                                                {
                                                                                    ...cropJourney,
                                                                                    steps: newSteps,
                                                                                },
                                                                            );
                                                                        }}
                                                                        className={`transition-colors focus:ring-2 focus:ring-green-500 ${
                                                                            isDarkMode
                                                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        className={
                                                                            isDarkMode
                                                                                ? 'text-gray-300'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        Durée
                                                                    </Label>
                                                                    <Input
                                                                        value={
                                                                            step
                                                                                .actions
                                                                                .duration
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newSteps =
                                                                                [
                                                                                    ...cropJourney.steps,
                                                                                ];
                                                                            newSteps[
                                                                                index
                                                                            ].actions.duration =
                                                                                e.target.value;
                                                                            setCropJourney(
                                                                                {
                                                                                    ...cropJourney,
                                                                                    steps: newSteps,
                                                                                },
                                                                            );
                                                                        }}
                                                                        className={`transition-colors focus:ring-2 focus:ring-green-500 ${
                                                                            isDarkMode
                                                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Step Pricing Section */}
                                                    <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                        <h4
                                                            className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                        >
                                                            <Coins className="h-5 w-5 text-yellow-500" />
                                                            Monétisation de
                                                            l'étape
                                                        </h4>
                                                        <div
                                                            className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}
                                                        >
                                                            <div className="mb-4 flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <Label
                                                                        className={`text-base font-medium ${isDarkMode ? 'text-white' : ''}`}
                                                                    >
                                                                        Étape
                                                                        Payante
                                                                    </Label>
                                                                    <p
                                                                        className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                                    >
                                                                        Bloquer
                                                                        cette
                                                                        étape
                                                                        derrière
                                                                        un
                                                                        paiement
                                                                        (Argent
                                                                        uniquement)
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    checked={
                                                                        step.isPaid ||
                                                                        false
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].isPaid =
                                                                            checked;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            {step.isPaid && (
                                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                                    <Label
                                                                        className={
                                                                            isDarkMode
                                                                                ? 'text-gray-300'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        Prix
                                                                        (FCFA)
                                                                    </Label>
                                                                    <div className="relative mt-1">
                                                                        <DollarSign className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                                                                        <Input
                                                                            type="number"
                                                                            value={
                                                                                step.priceAmount ||
                                                                                0
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const newSteps =
                                                                                    [
                                                                                        ...cropJourney.steps,
                                                                                    ];
                                                                                const parsedValue =
                                                                                    parseFloat(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    );
                                                                                newSteps[
                                                                                    index
                                                                                ].priceAmount =
                                                                                    isNaN(
                                                                                        parsedValue,
                                                                                    )
                                                                                        ? 0
                                                                                        : parsedValue;
                                                                                setCropJourney(
                                                                                    {
                                                                                        ...cropJourney,
                                                                                        steps: newSteps,
                                                                                    },
                                                                                );
                                                                            }}
                                                                            className={`pl-10 ${isDarkMode ? 'border-gray-500 bg-gray-600 text-white' : ''}`}
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                                        {/* Costs Section */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4
                                                                    className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                                >
                                                                    <DollarSign className="h-5 w-5 text-yellow-500" />
                                                                    Coûts
                                                                </h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        addCostItem(
                                                                            step.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Ajouter un
                                                                    coût
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {(
                                                                    step.costs ||
                                                                    []
                                                                ).map(
                                                                    (cost) => (
                                                                        <div
                                                                            key={
                                                                                cost.id
                                                                            }
                                                                            className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                                                        >
                                                                            <div className="mb-3 grid grid-cols-2 gap-3">
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Nom
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={
                                                                                            cost.name
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'name',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-yellow-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Montant
                                                                                    </Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={
                                                                                            cost.amount
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'amount',
                                                                                                parseInt(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ) ||
                                                                                                    0,
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-yellow-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="mb-3 grid grid-cols-3 gap-3">
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Unité
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={
                                                                                            cost.unit
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'unit',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-yellow-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Catégorie
                                                                                    </Label>
                                                                                    <select
                                                                                        value={
                                                                                            cost.category
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'category',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-yellow-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    >
                                                                                        <option value="tools">
                                                                                            Outils
                                                                                        </option>
                                                                                        <option value="seeds">
                                                                                            Semences
                                                                                        </option>
                                                                                        <option value="fertilizers">
                                                                                            Engrais
                                                                                        </option>
                                                                                        <option value="labor">
                                                                                            Main
                                                                                            d'œuvre
                                                                                        </option>
                                                                                        <option value="water">
                                                                                            Eau
                                                                                        </option>
                                                                                        <option value="other">
                                                                                            Autre
                                                                                        </option>
                                                                                    </select>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`recurring-${cost.id}`}
                                                                                        checked={
                                                                                            cost.recurring
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'recurring',
                                                                                                e
                                                                                                    .target
                                                                                                    .checked,
                                                                                            )
                                                                                        }
                                                                                        className="rounded"
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={`recurring-${cost.id}`}
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Récurrent
                                                                                    </Label>
                                                                                </div>
                                                                            </div>
                                                                            {cost.recurring && (
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Fréquence
                                                                                    </Label>
                                                                                    <select
                                                                                        value={
                                                                                            cost.frequency ||
                                                                                            'monthly'
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateCostItem(
                                                                                                step.id,
                                                                                                cost.id,
                                                                                                'frequency',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-yellow-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    >
                                                                                        <option value="weekly">
                                                                                            Hebdomadaire
                                                                                        </option>
                                                                                        <option value="monthly">
                                                                                            Mensuel
                                                                                        </option>
                                                                                        <option value="seasonally">
                                                                                            Saisonnier
                                                                                        </option>
                                                                                        <option value="yearly">
                                                                                            Annuel
                                                                                        </option>
                                                                                    </select>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-end">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        removeCostItem(
                                                                                            step.id,
                                                                                            cost.id,
                                                                                        )
                                                                                    }
                                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                                {step.costs
                                                                    .length ===
                                                                    0 && (
                                                                    <p
                                                                        className={`py-4 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                                                    >
                                                                        Aucun
                                                                        coût
                                                                        défini
                                                                        pour
                                                                        cette
                                                                        étape
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Routines Section */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4
                                                                    className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                                >
                                                                    <Calendar className="h-5 w-5 text-purple-500" />
                                                                    Routines
                                                                </h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        addRoutineTask(
                                                                            step.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Ajouter une
                                                                    routine
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {(
                                                                    step.routines ||
                                                                    []
                                                                ).map(
                                                                    (task) => (
                                                                        <div
                                                                            key={
                                                                                task.id
                                                                            }
                                                                            className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                                                        >
                                                                            <div className="mb-3 grid grid-cols-2 gap-3">
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Titre
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={
                                                                                            task.title
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateRoutineTask(
                                                                                                step.id,
                                                                                                task.id,
                                                                                                'title',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Heure
                                                                                    </Label>
                                                                                    <Input
                                                                                        type="time"
                                                                                        value={
                                                                                            task.time
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateRoutineTask(
                                                                                                step.id,
                                                                                                task.id,
                                                                                                'time',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="mb-3 space-y-2">
                                                                                <Label
                                                                                    className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                >
                                                                                    Description
                                                                                </Label>
                                                                                <Textarea
                                                                                    value={
                                                                                        task.description
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        updateRoutineTask(
                                                                                            step.id,
                                                                                            task.id,
                                                                                            'description',
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    rows={
                                                                                        2
                                                                                    }
                                                                                    className={`resize-none text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                                        isDarkMode
                                                                                            ? 'border-gray-500 bg-gray-600 text-white'
                                                                                            : ''
                                                                                    }`}
                                                                                />
                                                                            </div>
                                                                            <div className="mb-3 grid grid-cols-2 gap-3">
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Fréquence
                                                                                    </Label>
                                                                                    <select
                                                                                        value={
                                                                                            task.frequency
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateRoutineTask(
                                                                                                step.id,
                                                                                                task.id,
                                                                                                'frequency',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                                                                                            isDarkMode
                                                                                                ? 'border-gray-500 bg-gray-600 text-white'
                                                                                                : ''
                                                                                        }`}
                                                                                    >
                                                                                        <option value="daily">
                                                                                            Quotidien
                                                                                        </option>
                                                                                        <option value="weekly">
                                                                                            Hebdomadaire
                                                                                        </option>
                                                                                        <option value="monthly">
                                                                                            Mensuel
                                                                                        </option>
                                                                                        <option value="seasonally">
                                                                                            Saisonnier
                                                                                        </option>
                                                                                    </select>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`completed-${task.id}`}
                                                                                        checked={
                                                                                            task.completed
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateRoutineTask(
                                                                                                step.id,
                                                                                                task.id,
                                                                                                'completed',
                                                                                                e
                                                                                                    .target
                                                                                                    .checked,
                                                                                            )
                                                                                        }
                                                                                        className="rounded"
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={`completed-${task.id}`}
                                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                                    >
                                                                                        Complété
                                                                                    </Label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-end">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        removeRoutineTask(
                                                                                            step.id,
                                                                                            task.id,
                                                                                        )
                                                                                    }
                                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                                {step.routines
                                                                    .length ===
                                                                    0 && (
                                                                    <p
                                                                        className={`py-4 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                                                    >
                                                                        Aucune
                                                                        routine
                                                                        définie
                                                                        pour
                                                                        cette
                                                                        étape
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progression Section */}
                                                    <div className="mt-6 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 p-4 dark:from-orange-900/20 dark:to-red-900/20">
                                                        <h4
                                                            className={`mb-4 flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                        >
                                                            <Award className="h-5 w-5 text-orange-500" />
                                                            Progression
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                >
                                                                    Récompense
                                                                    XP
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        step
                                                                            .progression
                                                                            .xpReward
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].progression.xpReward =
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0;
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`nextLevelUnlock-${step.id}`}
                                                                        checked={
                                                                            step
                                                                                .progression
                                                                                .nextLevelUnlock
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newSteps =
                                                                                [
                                                                                    ...cropJourney.steps,
                                                                                ];
                                                                            newSteps[
                                                                                index
                                                                            ].progression.nextLevelUnlock =
                                                                                e.target.checked;
                                                                            setCropJourney(
                                                                                {
                                                                                    ...cropJourney,
                                                                                    steps: newSteps,
                                                                                },
                                                                            );
                                                                        }}
                                                                        className="rounded"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`nextLevelUnlock-${step.id}`}
                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                    >
                                                                        Débloque
                                                                        le
                                                                        niveau
                                                                        suivant
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 space-y-2">
                                                            <Label
                                                                className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                            >
                                                                Critères de
                                                                validation
                                                            </Label>
                                                            <div className="space-y-2">
                                                                {(
                                                                    step
                                                                        .progression
                                                                        ?.validationCriteria ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        criteria,
                                                                        criteriaIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                criteriaIndex
                                                                            }
                                                                            className="flex gap-2"
                                                                        >
                                                                            <Input
                                                                                value={
                                                                                    criteria
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) => {
                                                                                    const newSteps =
                                                                                        [
                                                                                            ...cropJourney.steps,
                                                                                        ];
                                                                                    newSteps[
                                                                                        index
                                                                                    ].progression.validationCriteria[
                                                                                        criteriaIndex
                                                                                    ] =
                                                                                        e.target.value;
                                                                                    setCropJourney(
                                                                                        {
                                                                                            ...cropJourney,
                                                                                            steps: newSteps,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className={`flex-1 text-sm transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                                                    isDarkMode
                                                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                                                        : ''
                                                                                }`}
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const newSteps =
                                                                                        [
                                                                                            ...cropJourney.steps,
                                                                                        ];
                                                                                    newSteps[
                                                                                        index
                                                                                    ].progression.validationCriteria =
                                                                                        step.progression.validationCriteria.filter(
                                                                                            (
                                                                                                _,
                                                                                                i,
                                                                                            ) =>
                                                                                                i !==
                                                                                                criteriaIndex,
                                                                                        );
                                                                                    setCropJourney(
                                                                                        {
                                                                                            ...cropJourney,
                                                                                            steps: newSteps,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="border-red-500 text-red-500 hover:bg-red-50"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ),
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newSteps =
                                                                            [
                                                                                ...cropJourney.steps,
                                                                            ];
                                                                        newSteps[
                                                                            index
                                                                        ].progression.validationCriteria.push(
                                                                            '',
                                                                        );
                                                                        setCropJourney(
                                                                            {
                                                                                ...cropJourney,
                                                                                steps: newSteps,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Ajouter un
                                                                    critère
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Business Plan Tab */}
                    {activeTab === 'business' && (
                        <motion.div
                            key="business"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div
                                className={`rounded-2xl p-6 ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-800/90'
                                        : 'bg-white/80'
                                }`}
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h3
                                        className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                    >
                                        Business Plan
                                    </h3>
                                    <Button
                                        type="button"
                                        onClick={downloadBusinessPlan}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger le Business Plan
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h4
                                            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            Informations financières
                                        </h4>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Investissement estimé (€)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={
                                                    cropJourney.businessPlan
                                                        .estimatedInvestment
                                                }
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        businessPlan: {
                                                            ...cropJourney.businessPlan,
                                                            estimatedInvestment:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        },
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Revenu attendu (€)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={
                                                    cropJourney.businessPlan
                                                        .expectedRevenue
                                                }
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        businessPlan: {
                                                            ...cropJourney.businessPlan,
                                                            expectedRevenue:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        },
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Marge bénéficiaire (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={
                                                    cropJourney.businessPlan
                                                        .profitMargin
                                                }
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        businessPlan: {
                                                            ...cropJourney.businessPlan,
                                                            profitMargin:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        },
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                ROI (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={
                                                    cropJourney.businessPlan.roi
                                                }
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        businessPlan: {
                                                            ...cropJourney.businessPlan,
                                                            roi:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        },
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : ''
                                                }
                                            >
                                                Période de rentabilité
                                            </Label>
                                            <Input
                                                value={
                                                    cropJourney.businessPlan
                                                        .paybackPeriod
                                                }
                                                onChange={(e) =>
                                                    setCropJourney({
                                                        ...cropJourney,
                                                        businessPlan: {
                                                            ...cropJourney.businessPlan,
                                                            paybackPeriod:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4
                                            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                        >
                                            Résumé du Business Plan
                                        </h4>
                                        <div
                                            className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span
                                                        className={
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : ''
                                                        }
                                                    >
                                                        Investissement total:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {calculateTotalCosts().total.toLocaleString()}{' '}
                                                        €
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span
                                                        className={
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : ''
                                                        }
                                                    >
                                                        Revenu attendu:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {cropJourney.businessPlan.expectedRevenue.toLocaleString()}{' '}
                                                        €
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span
                                                        className={
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : ''
                                                        }
                                                    >
                                                        Marge bénéficiaire:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {
                                                            cropJourney
                                                                .businessPlan
                                                                .profitMargin
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span
                                                        className={
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : ''
                                                        }
                                                    >
                                                        ROI:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {
                                                            cropJourney
                                                                .businessPlan
                                                                .roi
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span
                                                        className={
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : ''
                                                        }
                                                    >
                                                        Période de rentabilité:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                    >
                                                        {
                                                            cropJourney
                                                                .businessPlan
                                                                .paybackPeriod
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} mt-4`}
                                        >
                                            <h5
                                                className={`mb-3 font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                            >
                                                Répartition des coûts
                                            </h5>
                                            <div className="space-y-2">
                                                {[
                                                    'tools',
                                                    'seeds',
                                                    'fertilizers',
                                                    'labor',
                                                    'water',
                                                    'other',
                                                ].map((category) => {
                                                    const categoryCosts =
                                                        cropJourney.steps.flatMap(
                                                            (step) =>
                                                                step.costs.filter(
                                                                    (cost) =>
                                                                        cost.category ===
                                                                        category,
                                                                ),
                                                        );
                                                    const totalCategoryCost =
                                                        categoryCosts.reduce(
                                                            (total, cost) =>
                                                                total +
                                                                cost.amount,
                                                            0,
                                                        );

                                                    if (totalCategoryCost === 0)
                                                        return null;

                                                    return (
                                                        <div
                                                            key={category}
                                                            className="flex justify-between"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {getCategoryIcon(
                                                                    category,
                                                                )}
                                                                <span
                                                                    className={
                                                                        isDarkMode
                                                                            ? 'text-gray-300'
                                                                            : ''
                                                                    }
                                                                >
                                                                    {category ===
                                                                        'tools' &&
                                                                        'Outils'}
                                                                    {category ===
                                                                        'seeds' &&
                                                                        'Semences'}
                                                                    {category ===
                                                                        'fertilizers' &&
                                                                        'Engrais'}
                                                                    {category ===
                                                                        'labor' &&
                                                                        "Main d'œuvre"}
                                                                    {category ===
                                                                        'water' &&
                                                                        'Eau'}
                                                                    {category ===
                                                                        'other' &&
                                                                        'Autre'}
                                                                </span>
                                                            </div>
                                                            <span
                                                                className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                {totalCategoryCost.toLocaleString()}{' '}
                                                                €
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4
                                        className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                    >
                                        Détail des coûts par étape
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table
                                            className={`w-full border-collapse ${isDarkMode ? 'text-gray-300' : ''}`}
                                        >
                                            <thead>
                                                <tr
                                                    className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                                >
                                                    <th className="p-2 text-left">
                                                        Étape
                                                    </th>
                                                    <th className="p-2 text-left">
                                                        Coût unique
                                                    </th>
                                                    <th className="p-2 text-left">
                                                        Coût récurrent
                                                    </th>
                                                    <th className="p-2 text-left">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cropJourney.steps.map(
                                                    (step) => {
                                                        const oneTimeCosts =
                                                            step.costs
                                                                .filter(
                                                                    (cost) =>
                                                                        !cost.recurring,
                                                                )
                                                                .reduce(
                                                                    (
                                                                        total,
                                                                        cost,
                                                                    ) =>
                                                                        total +
                                                                        cost.amount,
                                                                    0,
                                                                );
                                                        const recurringCosts =
                                                            step.costs
                                                                .filter(
                                                                    (cost) =>
                                                                        cost.recurring,
                                                                )
                                                                .reduce(
                                                                    (
                                                                        total,
                                                                        cost,
                                                                    ) =>
                                                                        total +
                                                                        cost.amount,
                                                                    0,
                                                                );
                                                        const totalCost =
                                                            oneTimeCosts +
                                                            recurringCosts;

                                                        return (
                                                            <tr
                                                                key={step.id}
                                                                className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                                            >
                                                                <td className="p-2">
                                                                    {step.title}
                                                                </td>
                                                                <td className="p-2">
                                                                    {oneTimeCosts.toLocaleString()}{' '}
                                                                    €
                                                                </td>
                                                                <td className="p-2">
                                                                    {recurringCosts.toLocaleString()}{' '}
                                                                    €
                                                                </td>
                                                                <td className="p-2 font-semibold">
                                                                    {totalCost.toLocaleString()}{' '}
                                                                    €
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                                <tr
                                                    className={`font-semibold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                                                >
                                                    <td className="p-2">
                                                        Total
                                                    </td>
                                                    <td className="p-2">
                                                        {calculateTotalCosts().totalOneTime.toLocaleString()}{' '}
                                                        €
                                                    </td>
                                                    <td className="p-2">
                                                        {calculateTotalCosts().totalRecurring.toLocaleString()}{' '}
                                                        €
                                                    </td>
                                                    <td className="p-2">
                                                        {calculateTotalCosts().total.toLocaleString()}{' '}
                                                        €
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                    <Button
                        type="button"
                        onClick={handleConfigSubmit}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white hover:from-orange-600 hover:to-red-600"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        Sauvegarder la configuration
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit('/admin/growth')}
                        className={`py-3 font-semibold ${
                            isDarkMode
                                ? 'border-gray-600 hover:bg-gray-700'
                                : ''
                        }`}
                    >
                        Annuler
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default BusinessConfig;
