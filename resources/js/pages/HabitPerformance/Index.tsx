import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Coins,
    Flame,
    Gift,
    Heart,
    Lightbulb,
    Shield,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// Assuming toast is available or use console.log as fallback if not imported.
// I will check if toast is imported in the file. It wasn't in the previous file content provided by user.
// I will add import { toast } from 'sonner'; if I can.
// Actually I'll just use router config

interface Props {
    performanceData: {
        overview: {
            taskScore: number;
            taskSummary: string;
            financeScore: number;
            financeSummary: string;
        };
        weeklyPerformance: Array<{
            date: string;
            achieved: number;
            expected: number;
        }>;
        gamification: {
            xp: number;
            level: number;
            coins: number;
            streak: number;
            dailyBonusAvailable: boolean;
        };
    };
}

const HabitPerformanceIndex: React.FC<Props> = ({ performanceData }) => {
    const [showConfetti, setShowConfetti] = useState(false);
    // Use props for initial state
    const { gamification } = performanceData;
    const xp = gamification.xp; // Current XP
    const level = gamification.level;
    const coins = gamification.coins;
    const streak = gamification.streak;

    const [activeTab, setActiveTab] = useState<'tasks' | 'finance'>('tasks');
    const [selectedReward, setSelectedReward] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const totalScore = Math.round(
        (performanceData.overview.taskScore +
            performanceData.overview.financeScore) /
            2,
    );

    useEffect(() => {
        if (totalScore >= 80) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [totalScore]);

    const claimDailyBonus = () => {
        if (!gamification.dailyBonusAvailable || processing) return;
        setProcessing(true);
        router.post(
            route('habit-performance.bonus'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    // Toast handled by flash message usually, or we can add local toast here
                },
            },
        );
    };

    const buyReward = (rewardId: number, cost: number) => {
        if (coins < cost || processing) return;
        setProcessing(true);
        router.post(
            route('habit-performance.shop'),
            {
                reward_id: rewardId,
                cost: cost,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setSelectedReward(null);
                },
            },
        );
    };

    const getLevelInfo = (score: number) => {
        if (score >= 90) return { name: 'Légende', emoji: '👑' };
        if (score >= 80) return { name: 'Maître', emoji: '🏆' };
        if (score >= 70) return { name: 'Expert', emoji: '⭐' };
        if (score >= 60) return { name: 'Avancé', emoji: '🚀' };
        if (score >= 50) return { name: 'Intermédiaire', emoji: '💪' };
        return { name: 'Débutant', emoji: '🌱' };
    };

    // Calculate Progress to next level: simple formula based on 100 XP per level derived from Entity logic?
    // Entity: Level = 1 + floor(sqrt(XP / 100)).
    // Inverse: XP = ((Level - 1)^2) * 100.
    // Next Level XP = (Level^2) * 100.
    // Current Level Base XP = ((Level-1)^2) * 100.
    const currentLevelBaseXp = Math.pow(level - 1, 2) * 100; // e.g. L1->0, L2->100, L3->400
    const nextLevelXp = Math.pow(level, 2) * 100; // e.g. L1->100, L2->400, L3->900
    const xpProgress = Math.min(
        100,
        Math.max(
            0,
            ((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) *
                100,
        ),
    );

    const currentLevelInfo = getLevelInfo(totalScore); // keeping score based rank for display title

    const rewards = [
        { id: 1, name: "Boost d'énergie", cost: 100, icon: Zap },
        { id: 2, name: 'Double XP', cost: 150, icon: Star },
        { id: 3, name: 'Protection de série', cost: 200, icon: Shield },
        { id: 4, name: 'Bonus quotidien x2', cost: 250, icon: Gift },
    ];

    return (
        <AppLayout>
            <Head title="Habitudes & Performance - Mode Jeu" />

            <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
                {/* En-tête simplifié */}
                <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="container mx-auto p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">
                                    {currentLevelInfo.emoji}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Mon Aventure
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Niveau {level} · {currentLevelInfo.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-3 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {streak}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-3 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                    <Coins className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {coins}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Expérience Niv. {level}
                                </span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    {xp} / {nextLevelXp} XP
                                </span>
                            </div>
                            <Progress value={xpProgress} className="h-2" />
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="container mx-auto space-y-6 px-4 py-6">
                    {/* Cartes de performance */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('tasks')}
                            className={`rounded-xl border-2 p-6 text-left backdrop-blur-xl transition-all ${
                                activeTab === 'tasks'
                                    ? 'border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-500/10'
                                    : 'border-gray-200 bg-white/80 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                            }`}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Discipline
                                </span>
                                <Target
                                    className={`h-5 w-5 ${activeTab === 'tasks' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                                />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {performanceData.overview.taskScore}%
                            </div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Tâches complétées
                            </div>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('finance')}
                            className={`rounded-xl border-2 p-6 text-left backdrop-blur-xl transition-all ${
                                activeTab === 'finance'
                                    ? 'border-green-500 bg-green-50/80 dark:border-green-400 dark:bg-green-500/10'
                                    : 'border-gray-200 bg-white/80 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                            }`}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Santé
                                </span>
                                <Heart
                                    className={`h-5 w-5 ${activeTab === 'finance' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                                />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {performanceData.overview.financeScore}%
                            </div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Objectifs financiers
                            </div>
                        </motion.button>
                    </div>

                    {/* Conseil du jour */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                    Conseil du jour
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                    {activeTab === 'tasks'
                                        ? performanceData.overview.taskSummary
                                        : performanceData.overview
                                              .financeSummary}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Calendrier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Cette semaine
                            </h3>
                            <Badge variant="secondary">
                                {
                                    performanceData.weeklyPerformance.filter(
                                        (d) => d.achieved > 0,
                                    ).length
                                }
                                /7 jours
                            </Badge>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(
                                (day, i) => (
                                    <div
                                        key={i}
                                        className="mb-1 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
                                    >
                                        {day}
                                    </div>
                                ),
                            )}
                            {performanceData.weeklyPerformance.map((day, i) => {
                                const completed = day.achieved >= day.expected; // Or > 0 depending on logic, keeping existing
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        className={`flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            completed
                                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600'
                                        }`}
                                    >
                                        {completed && '✓'}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Boutique de récompenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Boutique
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {rewards.map((reward) => {
                                const Icon = reward.icon;
                                const affordable = coins >= reward.cost;

                                return (
                                    <motion.button
                                        key={reward.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            affordable &&
                                            setSelectedReward(reward.id)
                                        }
                                        disabled={!affordable}
                                        className={`rounded-lg border-2 p-4 text-left backdrop-blur-sm transition-all ${
                                            selectedReward === reward.id
                                                ? 'border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-500/10'
                                                : affordable
                                                  ? 'border-gray-200 bg-white/50 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                                                  : 'cursor-not-allowed border-gray-200 bg-gray-100/50 opacity-60 dark:border-white/10 dark:bg-white/5'
                                        }`}
                                    >
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                                            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {reward.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Coins className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {reward.cost}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {selectedReward && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4"
                                >
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            buyReward(
                                                selectedReward,
                                                rewards.find(
                                                    (r) =>
                                                        r.id === selectedReward,
                                                )?.cost || 0,
                                            )
                                        }
                                        disabled={processing}
                                    >
                                        Acheter pour{' '}
                                        {
                                            rewards.find(
                                                (r) => r.id === selectedReward,
                                            )?.cost
                                        }{' '}
                                        pièces
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Bonus quotidien */}
                    {gamification.dailyBonusAvailable && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="shrink-0 rounded-full bg-amber-100 p-2 dark:bg-amber-500/20">
                                        <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Bonus Quotidien
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            +50 pièces disponibles
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={claimDailyBonus}
                                    className="shrink-0"
                                    disabled={processing}
                                >
                                    Réclamer
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Défi de la semaine */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Défi de la Semaine
                            </h3>
                            <Trophy className="h-5 w-5 text-amber-500" />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    Maître de la Discipline
                                </div>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Complétez toutes vos tâches pendant 5 jours
                                    consécutifs
                                </p>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Progression
                                    </span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        3/5 jours
                                    </span>
                                </div>
                                <Progress value={60} className="h-2" />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-1.5">
                                    <Coins className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        +200
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        +50 XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Animation de succès */}
                <AnimatePresence>
                    {showConfetti && (
                        <motion.div
                            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="text-center"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                }}
                            >
                                <div className="mb-4 text-8xl">🎉</div>
                                <div className="text-4xl font-bold text-white">
                                    Excellent travail !
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default HabitPerformanceIndex;
