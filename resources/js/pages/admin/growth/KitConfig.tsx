// fichier: resources/js/Pages/Admin/Growth/KitConfig.tsx
import { growthApi, RoutineKit, RoutineKitTask } from '@/api/growthApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Coins,
    DollarSign,
    Eye,
    Image as ImageIcon,
    ListChecks,
    Moon,
    Pause,
    Plus,
    Settings,
    Sparkles,
    Sun,
    Target,
    TrendingUp,
    Upload,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Task {
    id: string;
    title: string;
    description: string;
    timeStart: string;
    timeEnd: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
}

interface DayTasks {
    day: string;
    tasks: Task[];
}

interface PageProps {
    item: RoutineKit;
}

// Helper function to transform backend tasks into weeklyTasks format
const transformTasksToWeeklyFormat = (tasks?: RoutineKitTask[]): DayTasks[] => {
    const daysOfWeek = [
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
        'Dimanche',
    ];

    // Initialize empty days
    const weeklyTasks: DayTasks[] = daysOfWeek.map((day) => ({
        day,
        tasks: [],
    }));

    // If no tasks, return empty structure
    if (!tasks || tasks.length === 0) {
        return weeklyTasks;
    }

    // Group tasks by day
    tasks.forEach((task) => {
        if (task.dayOfWeek && task.dayOfWeek >= 1 && task.dayOfWeek <= 7) {
            const dayIndex = task.dayOfWeek - 1; // dayOfWeek is 1-7, array is 0-6
            weeklyTasks[dayIndex].tasks.push({
                id: task.id,
                title: task.title,
                description: task.description || '',
                timeStart: task.timeStart || '09:00',
                timeEnd: task.timeEnd || '10:00',
                priority: task.priority || 'medium',
                completed: task.completed || false,
            });
        }
    });

    // Sort tasks by orderIndex within each day
    weeklyTasks.forEach((day) => {
        day.tasks.sort((a, b) => {
            const taskA = tasks.find((t) => t.id === a.id);
            const taskB = tasks.find((t) => t.id === b.id);
            return (taskA?.orderIndex || 0) - (taskB?.orderIndex || 0);
        });
    });

    return weeklyTasks;
};

const KitConfig = ({ item: propItem }: { item?: RoutineKit }) => {
    const { props } = usePage<any>();
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const [selectedItem] = useState<RoutineKit | null>(resolveItem());
    const [configForm, setConfigForm] = useState({
        title: selectedItem?.name || '',
        description: selectedItem?.description || '',
        status: (selectedItem?.status as any) || 'published',
        views: selectedItem?.views || 0,
        images: (selectedItem?.images || []) as (string | File)[],
        isPaid: selectedItem?.isPaid || false,
        priceAmount: selectedItem?.priceAmount || 0,
        priceCurrency: selectedItem?.priceCurrency || '$',
        weeklyTasks: transformTasksToWeeklyFormat(selectedItem?.tasks),
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
            const flattenedTasks = configForm.weeklyTasks.flatMap(
                (day: DayTasks, dayIndex: number) =>
                    day.tasks.map((task: Task, taskIndex: number) => ({
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        day_of_week: dayIndex + 1, // ✅ snake_case
                        order_index: taskIndex, // ✅ snake_case
                        time_start: task.timeStart, // ✅ snake_case
                        time_end: task.timeEnd, // ✅ snake_case
                        priority: task.priority,
                    })),
            );

            const formData = new FormData();
            formData.append('name', configForm.title);
            formData.append('description', configForm.description);
            formData.append('status', configForm.status);
            formData.append(
                'category',
                selectedItem?.category || 'Productivité',
            );
            formData.append('color', selectedItem?.color || '#3b82f6');
            formData.append('is_paid', configForm.isPaid ? '1' : '0');
            formData.append('price_amount', configForm.priceAmount.toString());
            formData.append('price_currency', configForm.priceCurrency);
            formData.append('tasks', JSON.stringify(flattenedTasks));

            // Handle images
            configForm.images.forEach((image) => {
                if (image instanceof File) {
                    formData.append('images[]', image);
                } else if (typeof image === 'string') {
                    formData.append('existing_images[]', image);
                }
            });

            if (selectedItem?.id) {
                await growthApi.updateRoutineKit(selectedItem.id, formData);
                toast.success('Configuration du kit mise à jour avec succès', {
                    icon: <Settings className="h-4 w-4 text-green-500" />,
                });
            } else {
                await growthApi.createRoutineKit(formData);
                toast.success('Kit créé avec succès');
            }

            setTimeout(() => {
                router.visit('/admin/growth');
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setConfigForm((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }));
        }
    };

    const removeImage = (index: number) => {
        setConfigForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const addTask = (dayIndex: number) => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: '',
            description: '',
            timeStart: '09:00',
            timeEnd: '10:00',
            priority: 'medium',
            completed: false,
        };

        setConfigForm((prev) => ({
            ...prev,
            weeklyTasks: prev.weeklyTasks.map((day: DayTasks, index: number) =>
                index === dayIndex
                    ? { ...day, tasks: [...day.tasks, newTask] }
                    : day,
            ),
        }));
    };

    const updateTask = (
        dayIndex: number,
        taskIndex: number,
        field: keyof Task,
        value: any,
    ) => {
        setConfigForm((prev) => ({
            ...prev,
            weeklyTasks: prev.weeklyTasks.map(
                (day: DayTasks, dIndex: number) =>
                    dIndex === dayIndex
                        ? {
                              ...day,
                              tasks: day.tasks.map(
                                  (task: Task, tIndex: number) =>
                                      tIndex === taskIndex
                                          ? { ...task, [field]: value }
                                          : task,
                              ),
                          }
                        : day,
            ),
        }));
    };

    const removeTask = (dayIndex: number, taskIndex: number) => {
        setConfigForm((prev) => ({
            ...prev,
            weeklyTasks: prev.weeklyTasks.map((day: DayTasks, index: number) =>
                index === dayIndex
                    ? {
                          ...day,
                          tasks: day.tasks.filter(
                              (_: any, i: number) => i !== taskIndex,
                          ),
                      }
                    : day,
            ),
        }));
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

    return (
        <AppLayout>
            <Head title={`Configuration - ${selectedItem?.name}`} />
            <Toaster
                position="top-right"
                theme={isDarkMode ? 'dark' : 'light'}
                className="dark:border-gray-700 dark:bg-gray-800"
            />

            <div
                className={`fixed inset-0 -z-10 transition-all duration-500 ${
                    isDarkMode
                        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20'
                        : 'bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50'
                }`}
            />

            <div className="container mx-auto max-w-6xl space-y-8 p-4 md:p-6">
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
                                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
                                : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10'
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
                            <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg">
                                <ListChecks className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1
                                    className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Configuration du Kit Routine
                                </h1>
                                <p
                                    className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                >
                                    {selectedItem?.name || 'Nouveau kit'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`grid grid-cols-2 gap-4 rounded-2xl p-6 md:grid-cols-4 ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800/90'
                            : 'bg-white/80'
                    }`}
                >
                    <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-purple-500">
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
                                {selectedItem?.imports || 0}
                            </span>
                        </div>
                        <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                        >
                            Importations
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-blue-500">
                            <Target className="h-5 w-5" />
                            <span className="text-2xl font-bold">
                                {configForm.weeklyTasks.reduce(
                                    (acc: number, day: DayTasks) =>
                                        acc + day.tasks.length,
                                    0,
                                )}
                            </span>
                        </div>
                        <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                        >
                            Tâches totales
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-orange-500">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-2xl font-bold">
                                +{selectedItem?.growth || 0}%
                            </span>
                        </div>
                        <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                        >
                            Croissance
                        </p>
                    </div>
                </motion.div>

                {/* Configuration Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`overflow-hidden rounded-2xl shadow-xl ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800/90'
                            : 'bg-white/80'
                    }`}
                >
                    <form
                        onSubmit={handleConfigSubmit}
                        className="space-y-8 p-8"
                    >
                        {/* Images Section */}
                        <div className="space-y-6">
                            <h3
                                className={`flex items-center gap-2 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                            >
                                <ImageIcon className="h-5 w-5" />
                                Images du Kit
                            </h3>

                            <div
                                className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-xl p-8 text-center`}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`inline-flex cursor-pointer items-center gap-3 rounded-lg px-6 py-3 ${
                                        isDarkMode
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    } transition-colors`}
                                >
                                    <Upload className="h-5 w-5" />
                                    Ajouter des images
                                </label>
                                <p
                                    className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                >
                                    PNG, JPG jusqu'à 10MB
                                </p>
                            </div>

                            {configForm.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {configForm.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative"
                                        >
                                            <img
                                                src={
                                                    image instanceof File
                                                        ? URL.createObjectURL(
                                                              image,
                                                          )
                                                        : image
                                                }
                                                alt={`Upload ${index + 1}`}
                                                className="h-32 w-full rounded-xl object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Informations de base
                                </h3>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Titre du kit
                                    </Label>
                                    <Input
                                        value={configForm.title}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                title: e.target.value,
                                            })
                                        }
                                        className={`transition-colors focus:ring-2 focus:ring-purple-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="Entrez un titre attractif"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        value={configForm.description}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={6}
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-purple-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="Décrivez votre routine..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Statut
                                    </Label>
                                    <select
                                        value={configForm.status}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                status: e.target.value as any,
                                            })
                                        }
                                        className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    >
                                        <option value="published">
                                            Publié
                                        </option>
                                        <option value="draft">Brouillon</option>
                                        <option value="archived">
                                            Archivé
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-6">
                                <h3
                                    className={`flex items-center gap-2 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    <Coins className="h-5 w-5" />
                                    Monétisation
                                </h3>

                                <div
                                    className={`rounded-xl border p-6 ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label
                                                className={`text-base font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                            >
                                                Kit Payant
                                            </Label>
                                            <p
                                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                            >
                                                Activer pour rendre ce kit
                                                payant (Monnaie ou XP)
                                            </p>
                                        </div>
                                        <Switch
                                            checked={configForm.isPaid}
                                            onCheckedChange={(checked) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    isPaid: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {configForm.isPaid && (
                                        <div className="grid animate-in grid-cols-1 gap-4 fade-in slide-in-from-top-2 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    className={
                                                        isDarkMode
                                                            ? 'text-gray-300'
                                                            : ''
                                                    }
                                                >
                                                    Type de coût
                                                </Label>
                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                priceCurrency:
                                                                    '$',
                                                            })
                                                        }
                                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                                            configForm.priceCurrency ===
                                                            '$'
                                                                ? 'border-green-500 bg-green-500/10 text-green-600'
                                                                : isDarkMode
                                                                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                                                  : 'border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        Argent
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                priceCurrency:
                                                                    'XP',
                                                            })
                                                        }
                                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                                            configForm.priceCurrency ===
                                                            'XP'
                                                                ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                                                                : isDarkMode
                                                                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                                                  : 'border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                        XP
                                                    </button>
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
                                                    Prix / Montant
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm.priceAmount
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                priceAmount:
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                            })
                                                        }
                                                        className={`pl-10 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : ''}`}
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute top-2.5 left-3 text-gray-400">
                                                        {configForm.priceCurrency ===
                                                        '$' ? (
                                                            <DollarSign className="h-4 w-4" />
                                                        ) : (
                                                            <Sparkles className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Tasks */}
                        <div className="space-y-6">
                            <h3
                                className={`flex items-center gap-2 text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                            >
                                <Calendar className="h-5 w-5" />
                                Tâches Hebdomadaires
                            </h3>

                            <div className="space-y-6">
                                {configForm.weeklyTasks.map(
                                    (day: DayTasks, dayIndex: number) => (
                                        <div
                                            key={day.day}
                                            className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4
                                                    className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                                >
                                                    {day.day}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        addTask(dayIndex)
                                                    }
                                                    className="bg-purple-500 text-white hover:bg-purple-600"
                                                    size="sm"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Ajouter une tâche
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {day.tasks.map(
                                                    (
                                                        task: Task,
                                                        taskIndex: number,
                                                    ) => (
                                                        <div
                                                            key={task.id}
                                                            className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                                                        >
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                                                                            updateTask(
                                                                                dayIndex,
                                                                                taskIndex,
                                                                                'title',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                            isDarkMode
                                                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                                                : ''
                                                                        }`}
                                                                        placeholder="Titre de la tâche"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                    >
                                                                        Heure
                                                                        début
                                                                    </Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={
                                                                            task.timeStart
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateTask(
                                                                                dayIndex,
                                                                                taskIndex,
                                                                                'timeStart',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                            isDarkMode
                                                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                    >
                                                                        Heure
                                                                        fin
                                                                    </Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={
                                                                            task.timeEnd
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateTask(
                                                                                dayIndex,
                                                                                taskIndex,
                                                                                'timeEnd',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className={`text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                            isDarkMode
                                                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="flex items-end">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeTask(
                                                                                dayIndex,
                                                                                taskIndex,
                                                                            )
                                                                        }
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="border-red-500 text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}
                                                                    >
                                                                        Priorité
                                                                    </Label>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateTask(
                                                                                    dayIndex,
                                                                                    taskIndex,
                                                                                    'priority',
                                                                                    'low',
                                                                                )
                                                                            }
                                                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                                                                                task.priority ===
                                                                                'low'
                                                                                    ? 'border-green-500 bg-green-500/10 font-semibold text-green-600'
                                                                                    : isDarkMode
                                                                                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                                                                      : 'border-gray-200 hover:bg-gray-100'
                                                                            }`}
                                                                        >
                                                                            🟢
                                                                            Basse
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateTask(
                                                                                    dayIndex,
                                                                                    taskIndex,
                                                                                    'priority',
                                                                                    'medium',
                                                                                )
                                                                            }
                                                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                                                                                task.priority ===
                                                                                'medium'
                                                                                    ? 'border-orange-500 bg-orange-500/10 font-semibold text-orange-600'
                                                                                    : isDarkMode
                                                                                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                                                                      : 'border-gray-200 hover:bg-gray-100'
                                                                            }`}
                                                                        >
                                                                            🟡
                                                                            Moyenne
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateTask(
                                                                                    dayIndex,
                                                                                    taskIndex,
                                                                                    'priority',
                                                                                    'high',
                                                                                )
                                                                            }
                                                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                                                                                task.priority ===
                                                                                'high'
                                                                                    ? 'border-red-500 bg-red-500/10 font-semibold text-red-600'
                                                                                    : isDarkMode
                                                                                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                                                                      : 'border-gray-200 hover:bg-gray-100'
                                                                            }`}
                                                                        >
                                                                            🔴
                                                                            Haute
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3">
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
                                                                        updateTask(
                                                                            dayIndex,
                                                                            taskIndex,
                                                                            'description',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    rows={2}
                                                                    className={`resize-none text-sm transition-colors focus:ring-2 focus:ring-purple-500 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600 bg-gray-700 text-white'
                                                                            : ''
                                                                    }`}
                                                                    placeholder="Description de la tâche..."
                                                                />
                                                            </div>
                                                        </div>
                                                    ),
                                                )}

                                                {day.tasks.length === 0 && (
                                                    <p
                                                        className={`py-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                                    >
                                                        Aucune tâche pour ce
                                                        jour. Cliquez sur
                                                        "Ajouter une tâche" pour
                                                        commencer.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white hover:from-purple-600 hover:to-pink-600"
                            >
                                <Settings className="mr-2 h-5 w-5" />
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
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
};

export default KitConfig;
