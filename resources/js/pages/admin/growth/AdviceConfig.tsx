// fichier: resources/js/Pages/Admin/Growth/AdviceConfig.tsx
import { Advice, growthApi } from '@/api/growthApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Eye,
    Image as ImageIcon,
    MessageSquare,
    Moon,
    Pause,
    Settings,
    Sun,
    TrendingUp,
    Upload,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface PageProps {
    item: Advice;
}

const AdviceConfig = ({ item: propItem }: { item?: Advice }) => {
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

    const [selectedItem] = useState<Advice | null>(resolveItem());

    const [configForm, setConfigForm] = useState({
        title: selectedItem?.title || '',
        shortDescription: selectedItem?.summary || '',
        longDescription: selectedItem?.content || '',
        status: selectedItem?.status || 'published',
        featured: selectedItem?.featured || false,
        publishedAt:
            selectedItem?.publishedAt || new Date().toISOString().slice(0, 16),
        views: selectedItem?.views || 0,
        videoUrl: selectedItem?.videoUrl || '',
        authorName: selectedItem?.authorName || '',
        readingTimeMinutes: selectedItem?.readingTimeMinutes || 5,
        images: (selectedItem?.images || []) as (string | File)[],
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
            const formData = new FormData();
            formData.append('title', configForm.title);
            formData.append('summary', configForm.shortDescription);
            formData.append('content', configForm.longDescription);
            formData.append('status', configForm.status);
            formData.append('featured', configForm.featured ? '1' : '0');
            formData.append('video_url', configForm.videoUrl);
            formData.append('category', selectedItem?.category || 'General');
            formData.append('author_name', configForm.authorName);
            formData.append(
                'reading_time_minutes',
                configForm.readingTimeMinutes.toString(),
            );

            // Handle images
            configForm.images.forEach((image) => {
                if (image instanceof File) {
                    formData.append('images[]', image);
                } else if (typeof image === 'string') {
                    formData.append('existing_images[]', image);
                }
            });

            if (selectedItem?.id) {
                await growthApi.updateAdvice(selectedItem.id, formData);
                toast.success(
                    'Configuration du conseil mise à jour avec succès',
                    {
                        icon: <Settings className="h-4 w-4 text-green-500" />,
                    },
                );
            } else {
                await growthApi.createAdvice(formData);
                toast.success('Conseil créé avec succès');
            }

            setTimeout(() => {
                router.visit('/admin/growth');
            }, 1000);
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
            <Head title={`Configuration - ${selectedItem?.title}`} />
            <Toaster
                position="top-right"
                theme={isDarkMode ? 'dark' : 'light'}
                className="dark:border-gray-700 dark:bg-gray-800"
            />

            <div
                className={`fixed inset-0 -z-10 transition-all duration-500 ${
                    isDarkMode
                        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
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
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
                                : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
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
                            <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4 shadow-lg">
                                <MessageSquare className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1
                                    className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Configuration du Conseil
                                </h1>
                                <p
                                    className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                                >
                                    {selectedItem?.title || 'Nouveau conseil'}
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
                        <div className="mb-2 flex items-center justify-center gap-2 text-blue-500">
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
                                {selectedItem?.shares || 0}
                            </span>
                        </div>
                        <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                        >
                            Partages
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-purple-500">
                            <Activity className="h-5 w-5" />
                            <span className="text-2xl font-bold">
                                {selectedItem?.engagement || 0}%
                            </span>
                        </div>
                        <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}
                        >
                            Engagement
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
                                Images du Conseil
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
                                        Titre du conseil
                                    </Label>
                                    <Input
                                        value={configForm.title}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                title: e.target.value,
                                            })
                                        }
                                        className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="Entrez un titre percutant"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Description courte
                                    </Label>
                                    <Textarea
                                        value={configForm.shortDescription}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                shortDescription:
                                                    e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="Résumé en une phrase..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Description détaillée
                                    </Label>
                                    <Textarea
                                        value={configForm.longDescription}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                longDescription: e.target.value,
                                            })
                                        }
                                        rows={8}
                                        className={`resize-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="Développez votre conseil en détail..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}
                                >
                                    Publication & Médias
                                </h3>

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
                                        className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                    >
                                        <option value="published">
                                            Publié
                                        </option>
                                        <option value="draft">Brouillon</option>
                                        <option value="scheduled">
                                            Programmé
                                        </option>
                                        <option value="archived">
                                            Archivé
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className={
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        Date de publication
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={configForm.publishedAt}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                publishedAt: e.target.value,
                                            })
                                        }
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
                                            isDarkMode ? 'text-gray-300' : ''
                                        }
                                    >
                                        URL de la vidéo (optionnel)
                                    </Label>
                                    <Input
                                        value={configForm.videoUrl}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                videoUrl: e.target.value,
                                            })
                                        }
                                        className={`transition-colors focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : ''
                                        }`}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={configForm.featured}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    featured: e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded"
                                        />
                                        <Label
                                            htmlFor="featured"
                                            className={`cursor-pointer ${isDarkMode ? 'text-gray-300' : ''}`}
                                        >
                                            Mettre en vedette
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white hover:from-blue-600 hover:to-cyan-600"
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

export default AdviceConfig;
