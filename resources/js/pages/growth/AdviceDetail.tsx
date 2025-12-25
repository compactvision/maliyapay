import { Advice } from '@/api/growthApi';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    ImageIcon,
    User,
    Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdviceDetailProps {
    advice: Advice;
}

const AdviceDetail = ({ advice }: AdviceDetailProps) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark =
            localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(isDark);
    }, []);

    // Helper to get YouTube embed URL
    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}`
            : null;
    };

    const embedUrl = advice.videoUrl
        ? getYoutubeEmbedUrl(advice.videoUrl)
        : null;

    return (
        <AppLayout>
            <Head title={advice.title} />

            {/* Background gradient */}
            <div
                className={`fixed inset-0 -z-10 transition-all duration-500 ${
                    isDarkMode
                        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
                }`}
            />

            <div className="container mx-auto max-w-4xl space-y-8 p-4 md:p-8">
                {/* Header Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/growth')}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Retour à la liste
                    </Button>
                </motion.div>

                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`overflow-hidden rounded-2xl shadow-xl ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800/90'
                            : 'border border-gray-100 bg-white/90'
                    } backdrop-blur-sm`}
                >
                    {/* Header Image or Gradient */}
                    <div className="relative h-64 w-full overflow-hidden md:h-96">
                        {advice.images && advice.images.length > 0 ? (
                            <img
                                src={advice.images[0]}
                                alt={advice.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                                <ImageIcon className="h-20 w-20 text-white/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                            <span className="mb-3 inline-block rounded-full bg-blue-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                {advice.category}
                            </span>
                            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                                {advice.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {advice.authorName || 'MaliyaPay'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {advice.readingTimeMinutes} min de lecture
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(
                                        advice.publishedAt,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Summary */}
                        <div className="mb-8 rounded-xl bg-blue-50 p-6 text-blue-900 italic dark:bg-blue-900/20 dark:text-blue-100">
                            {advice.summary}
                        </div>

                        {/* Video Embed */}
                        {embedUrl && (
                            <div className="mb-8 overflow-hidden rounded-xl bg-black">
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={embedUrl}
                                        title="Video"
                                        className="h-full w-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900 p-3 text-sm text-gray-300">
                                    <Youtube className="h-4 w-4 text-red-500" />
                                    <span>Contenu vidéo recommandé</span>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                        >
                            <div className="leading-relaxed whitespace-pre-wrap">
                                {advice.content ? (
                                    advice.content
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        Contenu détaillé non disponible.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {advice.images && advice.images.length > 1 && (
                            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {advice.images.slice(1).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Illustration ${idx + 2}`}
                                        className="h-48 w-full cursor-pointer rounded-lg object-cover transition-transform hover:scale-105"
                                        onClick={() =>
                                            window.open(img, '_blank')
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.article>
            </div>
        </AppLayout>
    );
};

export default AdviceDetail;
