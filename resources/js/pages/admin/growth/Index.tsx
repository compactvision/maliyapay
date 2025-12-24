import { Advice, BusinessModel, growthApi, RoutineKit } from '@/api/growthApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGrowth } from '@/hooks/useGrowth';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BarChart3,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    Edit3,
    Eye,
    ListChecks,
    MessageSquare,
    Moon,
    Package,
    Pause,
    Plus,
    Rocket,
    Sparkles,
    Sun,
    Target,
    Trash2,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const AdminGrowth = () => {
    const { advices, routineKits, businessModels, isLoading, refetch } =
        useGrowth();

    // UI States
    const [activeTab, setActiveTab] = useState('advices');
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [modalType, setModalType] = useState<
        'advice' | 'kit' | 'business' | null
    >(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Form States
    const [adviceForm, setAdviceForm] = useState({
        title: '',
        summary: '',
        content: '',
        category: 'Épargne',
    });

    const [kitForm, setKitForm] = useState({
        name: '',
        description: '',
        category: 'Productivité',
        color: '#3b82f6',
    });

    const [businessForm, setBusinessForm] = useState({
        title: '',
        description: '',
        icon: 'TrendingUp',
        difficulty: 'Moyen',
        potential: 'Élevé',
    });

    // Handle form submissions
    const handleAdviceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await growthApi.createAdvice(adviceForm);
            toast.success('Conseil ajouté avec succès', {
                icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
            });
            setAdviceForm({
                title: '',
                summary: '',
                content: '',
                category: 'Épargne',
            });
            setModalType(null);
            refetch();
        } catch (err) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    const handleDeleteAdvice = async (id: string) => {
        if (!confirm('Supprimer ce conseil ?')) return;
        try {
            await growthApi.deleteAdvice(id);
            toast.success('Conseil supprimé');
            refetch();
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleKitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await growthApi.createRoutineKit(kitForm);
            toast.success('Kit créé avec succès', {
                icon: <Package className="h-4 w-4 text-blue-500" />,
            });
            setKitForm({
                name: '',
                description: '',
                category: 'Productivité',
                color: '#3b82f6',
            });
            setModalType(null);
            refetch();
        } catch (err) {
            toast.error("Erreur lors de l'ajout du kit");
        }
    };

    const handleDeleteKit = async (id: string) => {
        if (!confirm('Supprimer ce kit ?')) return;
        try {
            await growthApi.deleteRoutineKit(id);
            toast.success('Kit supprimé');
            refetch();
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleBusinessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await growthApi.createBusinessModel(businessForm);
            toast.success('Business model créé avec succès', {
                icon: <Rocket className="h-4 w-4 text-purple-500" />,
            });
            setBusinessForm({
                title: '',
                description: '',
                icon: 'TrendingUp',
                difficulty: 'Moyen',
                potential: 'Élevé',
            });
            setModalType(null);
            refetch();
        } catch (err) {
            toast.error("Erreur lors de l'ajout du business model");
        }
    };

    const handleDeleteBusiness = async (id: string) => {
        if (!confirm('Supprimer ce business model ?')) return;
        try {
            await growthApi.deleteBusinessModel(id);
            toast.success('Business model supprimé');
            refetch();
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    // Navigation vers la page de configuration
    // Dans AdminGrowth.tsx, modifiez la fonction navigateToConfig
    const navigateToConfig = (
        item: Advice | RoutineKit | BusinessModel,
        type: 'advice' | 'kit' | 'business',
    ) => {
        const routeMap = {
            advice: '/admin/growth/advice/config',
            kit: '/admin/growth/kit/config',
            business: '/admin/growth/business/config',
        };

        router.visit(routeMap[type], {
            method: 'get',
            data: {
                item: JSON.stringify(item),
            },
            preserveState: false,
            preserveScroll: false,
        });
    };

    // Close FAB menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.fab-container')) {
                setIsFabOpen(false);
            }
        };

        if (isFabOpen) {
            document.addEventListener('click', handleClickOutside);
            return () =>
                document.removeEventListener('click', handleClickOutside);
        }
    }, [isFabOpen]);

    // Check system dark mode preference
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

    const handleActionClick = (actionFn: () => void) => {
        setIsFabOpen(false);
        actionFn();
    };

    const fabItems = [
        {
            id: 'advice',
            label: 'Conseil',
            icon: <MessageSquare className="h-5 w-5" />,
            color: 'from-blue-500 to-cyan-500',
            action: () => setModalType('advice'),
        },
        {
            id: 'kit',
            label: 'Kit Routine',
            icon: <ListChecks className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-500',
            action: () => setModalType('kit'),
        },
        {
            id: 'business',
            label: 'Business Quest',
            icon: <Briefcase className="h-5 w-5" />,
            color: 'from-orange-500 to-red-500',
            action: () => setModalType('business'),
        },
    ];

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const menuVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'archived':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <AppLayout>
            <Head title="Administration Croissance" />
            <Toaster
                position="top-right"
                theme={isDarkMode ? 'dark' : 'light'}
                className="dark:border-gray-700 dark:bg-gray-800"
            />

            {/* Background gradient - adapts to dark mode */}
            <div
                className={`fixed inset-0 -z-10 transition-all duration-500 ${
                    isDarkMode
                        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
                }`}
            />

            <div className="container mx-auto max-w-7xl space-y-8 p-4 md:p-6">
                {/* Header with dark mode toggle */}
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
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
                                : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                        }`}
                    />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-3 shadow-lg">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <h1
                                    className={`bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl`}
                                >
                                    Gestion de la Croissance
                                </h1>
                            </div>
                            <p
                                className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'} ml-16`}
                            >
                                Administrez les conseils, kits et business
                                models
                            </p>
                        </div>

                        {/* Dark mode toggle */}
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
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                    <Card
                        className={`group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${
                            isDarkMode
                                ? 'border-gray-700 bg-gray-800 hover:border-blue-500'
                                : ''
                        }`}
                        onClick={() => setActiveTab('advices')}
                    >
                        <div
                            className={`absolute inset-0 transition-opacity duration-300 ${
                                isDarkMode
                                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20'
                                    : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                            } opacity-0 group-hover:opacity-100`}
                        />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Conseils
                                    </p>
                                    <p className="text-3xl font-bold text-blue-500">
                                        {advices.length}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-full p-3 ${
                                        isDarkMode
                                            ? 'bg-blue-900/30'
                                            : 'bg-blue-100'
                                    }`}
                                >
                                    <MessageSquare className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${
                            isDarkMode
                                ? 'border-gray-700 bg-gray-800 hover:border-purple-500'
                                : ''
                        }`}
                        onClick={() => setActiveTab('kits')}
                    >
                        <div
                            className={`absolute inset-0 transition-opacity duration-300 ${
                                isDarkMode
                                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
                                    : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                            } opacity-0 group-hover:opacity-100`}
                        />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Kits Routines
                                    </p>
                                    <p className="text-3xl font-bold text-purple-500">
                                        {routineKits.length}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-full p-3 ${
                                        isDarkMode
                                            ? 'bg-purple-900/30'
                                            : 'bg-purple-100'
                                    }`}
                                >
                                    <ListChecks className="h-6 w-6 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${
                            isDarkMode
                                ? 'border-gray-700 bg-gray-800 hover:border-orange-500'
                                : ''
                        }`}
                        onClick={() => setActiveTab('business')}
                    >
                        <div
                            className={`absolute inset-0 transition-opacity duration-300 ${
                                isDarkMode
                                    ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20'
                                    : 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
                            } opacity-0 group-hover:opacity-100`}
                        />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                    >
                                        Business Quests
                                    </p>
                                    <p className="text-3xl font-bold text-orange-500">
                                        {businessModels.length}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-full p-3 ${
                                        isDarkMode
                                            ? 'bg-orange-900/30'
                                            : 'bg-orange-100'
                                    }`}
                                >
                                    <Briefcase className="h-6 w-6 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Content Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-6"
                >
                    {activeTab === 'advices' && (
                        <div className="space-y-4">
                            <div className="mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                <h2
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Conseils Publiés
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {advices.map((advice, index) => (
                                    <motion.div
                                        key={advice.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`group cursor-pointer border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-lg ${
                                                isDarkMode
                                                    ? 'border-gray-700 bg-gray-800 hover:border-blue-400'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                navigateToConfig(
                                                    advice,
                                                    'advice',
                                                )
                                            }
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <h3
                                                                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                {advice.title}
                                                            </h3>
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs ${
                                                                    isDarkMode
                                                                        ? 'bg-blue-900/30 text-blue-400'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}
                                                            >
                                                                {
                                                                    advice.category
                                                                }
                                                            </span>
                                                            <span
                                                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(advice.status || 'published')}`}
                                                            >
                                                                {getStatusIcon(
                                                                    advice.status ||
                                                                        'published',
                                                                )}
                                                                {advice.status ||
                                                                    'published'}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                                        >
                                                            {advice.summary}
                                                        </p>
                                                        <div
                                                            className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-muted-foreground'}`}
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(
                                                                    advice.createdAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                {advice.views ||
                                                                    0}{' '}
                                                                vues
                                                            </span>
                                                            {advice.featured && (
                                                                <span className="flex items-center gap-1 text-yellow-500">
                                                                    <Sparkles className="h-4 w-4" />
                                                                    En vedette
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigateToConfig(
                                                                    advice,
                                                                    'advice',
                                                                );
                                                            }}
                                                            className="text-blue-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-500/10 hover:text-blue-400"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAdvice(
                                                                    advice.id,
                                                                );
                                                            }}
                                                            className="text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'kits' && (
                        <div className="space-y-4">
                            <div className="mb-4 flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-purple-500" />
                                <h2
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Kits de Routines
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {routineKits.map((kit, index) => (
                                    <motion.div
                                        key={kit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`group cursor-pointer border-l-4 border-l-purple-500 transition-all duration-300 hover:shadow-lg ${
                                                isDarkMode
                                                    ? 'border-gray-700 bg-gray-800 hover:border-purple-400'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                navigateToConfig(kit, 'kit')
                                            }
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div
                                                                className="h-4 w-4 rounded-full shadow-sm"
                                                                style={{
                                                                    backgroundColor:
                                                                        kit.color ||
                                                                        '#3b82f6',
                                                                }}
                                                            />
                                                            <h3
                                                                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                {kit.name}
                                                            </h3>
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs ${
                                                                    isDarkMode
                                                                        ? 'bg-purple-900/30 text-purple-400'
                                                                        : 'bg-purple-100 text-purple-700'
                                                                }`}
                                                            >
                                                                {kit.category}
                                                            </span>
                                                            <span
                                                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(kit.status || 'published')}`}
                                                            >
                                                                {getStatusIcon(
                                                                    kit.status ||
                                                                        'published',
                                                                )}
                                                                {kit.status ||
                                                                    'published'}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                                        >
                                                            {kit.description}
                                                        </p>
                                                        <div
                                                            className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-muted-foreground'}`}
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <Target className="h-4 w-4" />
                                                                {kit.tasks
                                                                    ?.length ||
                                                                    0}{' '}
                                                                tâches
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                {kit.views || 0}{' '}
                                                                vues
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                {kit.imports ||
                                                                    0}{' '}
                                                                importations
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigateToConfig(
                                                                    kit,
                                                                    'kit',
                                                                );
                                                            }}
                                                            className="text-purple-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-purple-500/10 hover:text-purple-400"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteKit(
                                                                    kit.id,
                                                                );
                                                            }}
                                                            className="text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="space-y-4">
                            <div className="mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-orange-500" />
                                <h2
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Business Quests
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {businessModels.map((bus, index) => (
                                    <motion.div
                                        key={bus.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`group cursor-pointer border-l-4 border-l-orange-500 transition-all duration-300 hover:shadow-lg ${
                                                isDarkMode
                                                    ? 'border-gray-700 bg-gray-800 hover:border-orange-400'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                navigateToConfig(
                                                    bus,
                                                    'business',
                                                )
                                            }
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div
                                                                className={`rounded-lg p-2 ${
                                                                    isDarkMode
                                                                        ? 'bg-orange-900/30'
                                                                        : 'bg-orange-100'
                                                                }`}
                                                            >
                                                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                                            </div>
                                                            <h3
                                                                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                            >
                                                                {bus.title}
                                                            </h3>
                                                            <span
                                                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(bus.status || 'published')}`}
                                                            >
                                                                {getStatusIcon(
                                                                    bus.status ||
                                                                        'published',
                                                                )}
                                                                {bus.status ||
                                                                    'published'}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                                        >
                                                            {bus.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span
                                                                className={`rounded-full px-2 py-1 ${
                                                                    isDarkMode
                                                                        ? 'bg-orange-900/30 text-orange-400'
                                                                        : 'bg-orange-100 text-orange-700'
                                                                }`}
                                                            >
                                                                {bus.difficulty}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2 py-1 ${
                                                                    isDarkMode
                                                                        ? 'bg-green-900/30 text-green-400'
                                                                        : 'bg-green-100 text-green-700'
                                                                }`}
                                                            >
                                                                {bus.potential}
                                                            </span>
                                                            <span
                                                                className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-muted-foreground'}`}
                                                            >
                                                                <Zap className="h-4 w-4" />
                                                                {bus.steps
                                                                    ?.length ||
                                                                    0}{' '}
                                                                étapes
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                {bus.views || 0}{' '}
                                                                vues
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigateToConfig(
                                                                    bus,
                                                                    'business',
                                                                );
                                                            }}
                                                            className="text-orange-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-orange-500/10 hover:text-orange-400"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteBusiness(
                                                                    bus.id,
                                                                );
                                                            }}
                                                            className="text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Backdrop - Séparé du FAB */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsFabOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <div className="fab-container fixed right-4 bottom-6 z-50">
                {/* Actions Menu */}
                <AnimatePresence>
                    {isFabOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={menuVariants}
                            className="absolute right-0 bottom-16 flex flex-col items-end gap-4"
                        >
                            {fabItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="flex items-center gap-3"
                                >
                                    <button
                                        onClick={() =>
                                            handleActionClick(item.action)
                                        }
                                        className="flex items-center gap-3"
                                    >
                                        <motion.span
                                            className={`rounded-full px-3 py-1 text-sm font-medium shadow-sm backdrop-blur-md ${
                                                isDarkMode
                                                    ? 'bg-gray-800/90 text-white'
                                                    : 'bg-white/90 text-gray-800'
                                            }`}
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{
                                                delay: 0.2 + index * 0.05,
                                            }}
                                        >
                                            {item.label}
                                        </motion.span>
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color} text-white shadow-lg`}
                                        >
                                            {item.icon}
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB Toggle */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFabOpen(!isFabOpen);
                    }}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-colors duration-300 ${
                        isFabOpen
                            ? 'bg-slate-800 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                    }`}
                    whileTap={{ scale: 0.9 }}
                    animate={isFabOpen ? { rotate: 45 } : { rotate: 0 }}
                >
                    <AnimatePresence mode="wait">
                        {isFabOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="h-7 w-7" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Plus className="h-7 w-7" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pulsing ring animation when closed */}
                    {!isFabOpen && (
                        <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-blue-500"
                            animate={{
                                scale: [1, 1.4, 1.5],
                                opacity: [0.5, 0.2, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />
                    )}
                </motion.button>
            </div>

            {/* Create Modals */}
            <AnimatePresence>
                {modalType === 'advice' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:p-8"
                        onClick={() => setModalType(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
                                isDarkMode
                                    ? 'border border-gray-700 bg-gray-800'
                                    : 'bg-white'
                            }`}
                        >
                            <div
                                className={`sticky top-0 flex items-center justify-between p-6 transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'border-b border-gray-700 bg-gray-800'
                                        : 'border-b bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2 shadow-lg">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <h2
                                        className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                    >
                                        Ajouter un Conseil
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setModalType(null)}
                                    className={
                                        isDarkMode ? 'hover:bg-gray-700' : ''
                                    }
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form
                                onSubmit={handleAdviceSubmit}
                                className="space-y-6 p-6"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="title"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Titre
                                        </Label>
                                        <Input
                                            id="title"
                                            value={adviceForm.title}
                                            onChange={(e) =>
                                                setAdviceForm({
                                                    ...adviceForm,
                                                    title: e.target.value,
                                                })
                                            }
                                            required
                                            className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="category"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Catégorie
                                        </Label>
                                        <Input
                                            id="category"
                                            value={adviceForm.category}
                                            onChange={(e) =>
                                                setAdviceForm({
                                                    ...adviceForm,
                                                    category: e.target.value,
                                                })
                                            }
                                            required
                                            className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="summary"
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Résumé
                                    </Label>
                                    <Input
                                        id="summary"
                                        value={adviceForm.summary}
                                        onChange={(e) =>
                                            setAdviceForm({
                                                ...adviceForm,
                                                summary: e.target.value,
                                            })
                                        }
                                        required
                                        className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="content"
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Contenu détaillé
                                    </Label>
                                    <Textarea
                                        id="content"
                                        value={adviceForm.content}
                                        onChange={(e) =>
                                            setAdviceForm({
                                                ...adviceForm,
                                                content: e.target.value,
                                            })
                                        }
                                        rows={6}
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Publier le conseil
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setModalType(null)}
                                        className={
                                            isDarkMode
                                                ? 'border-gray-600 hover:bg-gray-700'
                                                : ''
                                        }
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {modalType === 'kit' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:p-8"
                        onClick={() => setModalType(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
                                isDarkMode
                                    ? 'border border-gray-700 bg-gray-800'
                                    : 'bg-white'
                            }`}
                        >
                            <div
                                className={`sticky top-0 flex items-center justify-between p-6 transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'border-b border-gray-700 bg-gray-800'
                                        : 'border-b bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2 shadow-lg">
                                        <ListChecks className="h-5 w-5 text-white" />
                                    </div>
                                    <h2
                                        className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                    >
                                        Créer un Kit de Routine
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setModalType(null)}
                                    className={
                                        isDarkMode ? 'hover:bg-gray-700' : ''
                                    }
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form
                                onSubmit={handleKitSubmit}
                                className="space-y-6 p-6"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="kitName"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Nom du kit
                                        </Label>
                                        <Input
                                            id="kitName"
                                            value={kitForm.name}
                                            onChange={(e) =>
                                                setKitForm({
                                                    ...kitForm,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                            className={`transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="kitCategory"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Catégorie
                                        </Label>
                                        <Input
                                            id="kitCategory"
                                            value={kitForm.category}
                                            onChange={(e) =>
                                                setKitForm({
                                                    ...kitForm,
                                                    category: e.target.value,
                                                })
                                            }
                                            required
                                            className={`transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="kitDesc"
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="kitDesc"
                                        value={kitForm.description}
                                        onChange={(e) =>
                                            setKitForm({
                                                ...kitForm,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={4}
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-purple-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="kitColor"
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Couleur du thème
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="kitColor"
                                            type="color"
                                            value={kitForm.color}
                                            onChange={(e) =>
                                                setKitForm({
                                                    ...kitForm,
                                                    color: e.target.value,
                                                })
                                            }
                                            className="h-10 w-20 cursor-pointer rounded"
                                        />
                                        <Input
                                            value={kitForm.color}
                                            onChange={(e) =>
                                                setKitForm({
                                                    ...kitForm,
                                                    color: e.target.value,
                                                })
                                            }
                                            placeholder="#3b82f6"
                                            className={`flex-1 transition-colors ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer le kit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setModalType(null)}
                                        className={
                                            isDarkMode
                                                ? 'border-gray-600 hover:bg-gray-700'
                                                : ''
                                        }
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {modalType === 'business' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:p-8"
                        onClick={() => setModalType(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
                                isDarkMode
                                    ? 'border border-gray-700 bg-gray-800'
                                    : 'bg-white'
                            }`}
                        >
                            <div
                                className={`sticky top-0 flex items-center justify-between p-6 transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'border-b border-gray-700 bg-gray-800'
                                        : 'border-b bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-2 shadow-lg">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <h2
                                        className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                    >
                                        Créer une Business Quest
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setModalType(null)}
                                    className={
                                        isDarkMode ? 'hover:bg-gray-700' : ''
                                    }
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form
                                onSubmit={handleBusinessSubmit}
                                className="space-y-6 p-6"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="busTitle"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Titre
                                        </Label>
                                        <Input
                                            id="busTitle"
                                            value={businessForm.title}
                                            onChange={(e) =>
                                                setBusinessForm({
                                                    ...businessForm,
                                                    title: e.target.value,
                                                })
                                            }
                                            required
                                            className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="busIcon"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Icône (Lucide)
                                        </Label>
                                        <Input
                                            id="busIcon"
                                            value={businessForm.icon}
                                            onChange={(e) =>
                                                setBusinessForm({
                                                    ...businessForm,
                                                    icon: e.target.value,
                                                })
                                            }
                                            placeholder="TrendingUp"
                                            className={`transition-colors focus:ring-2 focus:ring-orange-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="busDesc"
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="busDesc"
                                        value={businessForm.description}
                                        onChange={(e) =>
                                            setBusinessForm({
                                                ...businessForm,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={4}
                                        required
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-orange-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="busDiff"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Difficulté
                                        </Label>
                                        <select
                                            id="busDiff"
                                            value={businessForm.difficulty}
                                            onChange={(e) =>
                                                setBusinessForm({
                                                    ...businessForm,
                                                    difficulty: e.target.value,
                                                })
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        >
                                            <option value="Facile">
                                                Facile
                                            </option>
                                            <option value="Moyen">Moyen</option>
                                            <option value="Difficile">
                                                Difficile
                                            </option>
                                            <option value="Expert">
                                                Expert
                                            </option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="busPot"
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : ''
                                            }
                                        >
                                            Potentiel
                                        </Label>
                                        <select
                                            id="busPot"
                                            value={businessForm.potential}
                                            onChange={(e) =>
                                                setBusinessForm({
                                                    ...businessForm,
                                                    potential: e.target.value,
                                                })
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-500 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-white'
                                                    : ''
                                            }`}
                                        >
                                            <option value="Faible">
                                                Faible
                                            </option>
                                            <option value="Moyen">Moyen</option>
                                            <option value="Élevé">Élevé</option>
                                            <option value="Très élevé">
                                                Très élevé
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer la quest
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setModalType(null)}
                                        className={
                                            isDarkMode
                                                ? 'border-gray-600 hover:bg-gray-700'
                                                : ''
                                        }
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default AdminGrowth;
