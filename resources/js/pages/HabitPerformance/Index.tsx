import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Calendar,
    Coins,
    Flame,
    Gift,
    Heart,
    Lightbulb,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ForecastData {
    currency: string;
    current_balance: number;
    avg_daily_spending: number;
    projected_end_balance: number;
    projected_change: number;
    projected_change_percentage: number;
    zero_balance_date: string | null;
    days_until_zero: number | null;
    status: 'positive' | 'neutral' | 'warning' | 'critical';
    is_critical: boolean;
    is_warning: boolean;
    is_positive: boolean;
    recommendations: string[];
}

interface PerformanceSnapshot {
    date: string;
    financial_score: number;
    task_score: number;
    overall_score: number;
    xp_gained: number;
    xp_lost: number;
    net_xp: number;
}

interface PerformanceHistory {
    period: {
        start: string;
        end: string;
        days: number;
    };
    snapshots: PerformanceSnapshot[];
    statistics: {
        avg_financial_score: number;
        avg_task_score: number;
        avg_overall_score: number;
        total_xp_gained: number;
        total_xp_lost: number;
        net_xp: number;
    };
}

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
            streakDays: number;
            overallScore: number;
            financialScore: number;
            taskScore: number;
            dailyBonusAvailable: boolean;
            totalXpEarned: number;
            totalXpLost: number;
        };
    };
    forecasts?: ForecastData[];
    history?: PerformanceHistory;
}

const HabitPerformanceIndex: React.FC<Props> = ({
    performanceData,
    forecasts,
    history,
}) => {
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (forecasts && forecasts.length > 0 && !selectedCurrency) {
            setSelectedCurrency(forecasts[0].currency);
        }
    }, [forecasts]);

    const activeForecast =
        forecasts?.find((f) => f.currency === selectedCurrency) ||
        forecasts?.[0];
    const [showConfetti, setShowConfetti] = useState(false);
    const { gamification } = performanceData;
    const xp = gamification.xp;
    const level = gamification.level;
    const coins = gamification.coins;
    const streak = gamification.streak;

    const [activeTab, setActiveTab] = useState<
        'overview' | 'forecast' | 'history'
    >('overview');
    const [selectedReward, setSelectedReward] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasPlayedCelebration, setHasPlayedCelebration] = useState(false);

    const overallScore = gamification.overallScore;
    const taskScore = performanceData.overview.taskScore;

    // Célébration quand toutes les tâches sont complétées
    useEffect(() => {
        if (taskScore === 100 && !hasPlayedCelebration) {
            setHasPlayedCelebration(true);

            // Son de célébration
            if (!audioRef.current) {
                audioRef.current = new Audio(
                    'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
                );
            }
            audioRef.current.play().catch(() => {});

            // Effet confetti amélioré
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
            };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: randomInRange(0.1, 0.3),
                        y: Math.random() - 0.2,
                    },
                    colors: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                    ],
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: randomInRange(0.7, 0.9),
                        y: Math.random() - 0.2,
                    },
                    colors: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                    ],
                });
            }, 250);

            // Toast de célébration
            toast.success('🎉 Objectif Quotidien Atteint !', {
                description:
                    'Toutes vos tâches sont complétées. Excellent travail ! 💪',
                duration: 5000,
            });

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [taskScore, hasPlayedCelebration]);

    const claimDailyBonus = () => {
        if (!gamification.dailyBonusAvailable || processing) return;
        setProcessing(true);
        router.post(
            route('habit-performance.bonus'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
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

    const getLevelTitle = (lvl: number) => {
        if (lvl >= 90) return { name: 'Perfection Absolue', emoji: '👑' };
        if (lvl >= 80) return { name: 'Virtuose', emoji: '🏆' };
        if (lvl >= 70) return { name: 'Grand Maître', emoji: '⭐' };
        if (lvl >= 60) return { name: 'Maître', emoji: '🎖️' };
        if (lvl >= 50) return { name: 'Expert', emoji: '💎' };
        if (lvl >= 40) return { name: 'Expérimenté', emoji: '🚀' };
        if (lvl >= 30) return { name: 'Compétent', emoji: '💪' };
        if (lvl >= 20) return { name: 'Pratiquant', emoji: '📚' };
        if (lvl >= 10) return { name: 'Apprenti', emoji: '🌟' };
        return { name: 'Novice', emoji: '🌱' };
    };

    // Calcul progression niveau (système 1-100, 1000 XP/niveau)
    const currentLevelBaseXp = (level - 1) * 1000;
    const nextLevelXp = level * 1000;
    const xpInCurrentLevel = xp - currentLevelBaseXp;
    const xpProgress = Math.min(
        100,
        Math.max(0, (xpInCurrentLevel / 1000) * 100),
    );
    const xpToNextLevel = Math.max(0, nextLevelXp - xp);

    const currentLevelInfo = getLevelTitle(level);

    const rewards = [
        { id: 1, name: "Boost d'énergie", cost: 100, icon: Zap },
        { id: 2, name: 'Double XP', cost: 150, icon: Star },
        { id: 3, name: 'Protection de série', cost: 200, icon: Shield },
        { id: 4, name: 'Bonus quotidien x2', cost: 250, icon: Gift },
    ];

    const getForecastStatusColor = (status: string) => {
        switch (status) {
            case 'critical':
                return 'text-red-600 dark:text-red-400';
            case 'warning':
                return 'text-orange-600 dark:text-orange-400';
            case 'positive':
                return 'text-emerald-600 dark:text-emerald-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getForecastIcon = (status: string) => {
        switch (status) {
            case 'critical':
                return (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                );
            case 'warning':
                return (
                    <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                );
            case 'positive':
                return (
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                );
            default:
                return (
                    <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                );
        }
    };

    return (
        <AppLayout>
            <Head title="Habitudes & Performance" />

            <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
                {/* En-tête avec niveau et XP */}
                <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto w-full p-4 sm:p-6">
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
                                        {gamification.streakDays}
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
                                    Niveau {level} → {level + 1}
                                </span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    {xpInCurrentLevel} / 1000 XP (
                                    {xpToNextLevel} restants)
                                </span>
                            </div>
                            <Progress value={xpProgress} className="h-2" />
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                                <span>Total: {xp.toLocaleString()} XP</span>
                                <span>
                                    +
                                    {gamification.totalXpEarned.toLocaleString()}{' '}
                                    / -
                                    {gamification.totalXpLost.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs de navigation */}
                <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto w-full px-4">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'overview'
                                        ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                Vue d'ensemble
                            </button>
                            <button
                                onClick={() => setActiveTab('forecast')}
                                className={`px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'forecast'
                                        ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                Prévisions
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'history'
                                        ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                Historique
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="mx-auto w-full space-y-6 px-0 py-6 sm:px-4">
                    {/* Vue d'ensemble */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Cartes de performance */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border-2 border-blue-500 bg-blue-50/80 p-6 backdrop-blur-xl dark:border-blue-400 dark:bg-blue-500/10"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Discipline
                                        </span>
                                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {taskScore}%
                                    </div>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-500/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${taskScore}%` }}
                                            className="h-full bg-blue-600 dark:bg-blue-400"
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        {taskScore === 100
                                            ? '🎉 Discipline parfaite !'
                                            : 'Progression quotidienne'}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-xl border-2 border-emerald-500 bg-emerald-50/80 p-6 backdrop-blur-xl dark:border-emerald-400 dark:bg-emerald-500/10"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Santé Financière
                                        </span>
                                        <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {performanceData.overview.financeScore}%
                                    </div>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${performanceData.overview.financeScore}%`,
                                            }}
                                            className={`h-full ${performanceData.overview.financeScore < 50 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'}`}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        {performanceData.overview.financeScore >
                                        90
                                            ? 'Budget parfaitement géré !'
                                            : performanceData.overview
                                                    .financeScore < 50
                                              ? 'Dépenses élevées...'
                                              : 'Gestion saine'}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Conseils */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                            Conseils Personnalisés
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                <strong>Tâches:</strong>{' '}
                                                {
                                                    performanceData.overview
                                                        .taskSummary
                                                }
                                            </p>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                <strong>Finance:</strong>{' '}
                                                {
                                                    performanceData.overview
                                                        .financeSummary
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Calendrier hebdomadaire */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
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
                                    {performanceData.weeklyPerformance.map(
                                        (day, i) => {
                                            const completed =
                                                day.achieved >= day.expected;
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
                                        },
                                    )}
                                </div>
                            </motion.div>

                            {/* Boutique */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
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
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
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
                                                                r.id ===
                                                                selectedReward,
                                                        )?.cost || 0,
                                                    )
                                                }
                                                disabled={processing}
                                            >
                                                Acheter pour{' '}
                                                {
                                                    rewards.find(
                                                        (r) =>
                                                            r.id ===
                                                            selectedReward,
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
                                transition={{ delay: 0.5 }}
                                className="rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Défi de la Semaine
                                    </h3>
                                    <Trophy
                                        className={`h-5 w-5 ${gamification.streakDays >= 5 ? 'text-amber-500' : 'text-gray-400'}`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            Maître de la Discipline
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Complétez toutes vos tâches pendant
                                            5 jours consécutifs
                                        </p>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Série actuelle
                                            </span>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                {gamification.streakDays}/5
                                                jours
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(
                                                100,
                                                (gamification.streakDays / 5) *
                                                    100,
                                            )}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Coins className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                +500
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                +100 XP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}

                    {/* Prévisions financières */}
                    {activeTab === 'forecast' && activeForecast && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Sélecteur de devise */}
                            {forecasts && forecasts.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {forecasts.map((f) => (
                                        <Button
                                            key={f.currency}
                                            variant={
                                                activeForecast.currency ===
                                                f.currency
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setSelectedCurrency(f.currency)
                                            }
                                            size="sm"
                                            className="rounded-full whitespace-nowrap"
                                        >
                                            {f.currency}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Statut général */}
                            <div
                                className={`rounded-xl border-2 p-6 ${
                                    activeForecast.is_critical
                                        ? 'border-red-500 bg-red-50/80 dark:border-red-400 dark:bg-red-500/10'
                                        : activeForecast.is_warning
                                          ? 'border-orange-500 bg-orange-50/80 dark:border-orange-400 dark:bg-orange-500/10'
                                          : activeForecast.is_positive
                                            ? 'border-emerald-500 bg-emerald-50/80 dark:border-emerald-400 dark:bg-emerald-500/10'
                                            : 'border-gray-200 bg-white/80 dark:border-white/10 dark:bg-white/5'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 rounded-full bg-white p-2 dark:bg-white/10">
                                        {getForecastIcon(activeForecast.status)}
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className={`mb-1 text-lg font-bold ${getForecastStatusColor(activeForecast.status)}`}
                                        >
                                            Prévision Fin de Mois (
                                            {activeForecast.currency})
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {activeForecast.projected_end_balance >=
                                            0
                                                ? '+'
                                                : ''}
                                            {activeForecast.projected_end_balance.toFixed(
                                                2,
                                            )}{' '}
                                            {activeForecast.currency}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            {activeForecast.projected_change >=
                                            0 ? (
                                                <ArrowUp className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <ArrowDown className="h-4 w-4 text-red-600" />
                                            )}
                                            <span
                                                className={
                                                    activeForecast.projected_change >=
                                                    0
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                {Math.abs(
                                                    activeForecast.projected_change,
                                                ).toFixed(2)}{' '}
                                                {activeForecast.currency}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-500">
                                                (
                                                {activeForecast.projected_change_percentage >
                                                0
                                                    ? '+'
                                                    : ''}
                                                {activeForecast.projected_change_percentage.toFixed(
                                                    1,
                                                )}
                                                %)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Détails */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        Solde Actuel
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {activeForecast.current_balance.toFixed(
                                            2,
                                        )}{' '}
                                        {activeForecast.currency}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        Dépenses Moyennes
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {activeForecast.avg_daily_spending.toFixed(
                                            2,
                                        )}{' '}
                                        {activeForecast.currency}/jour
                                    </div>
                                </div>
                            </div>

                            {/* Alerte solde zéro */}
                            {activeForecast.zero_balance_date && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                                    <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        <span className="font-semibold">
                                            Alerte Trésorerie
                                        </span>
                                    </div>
                                    <p className="text-sm text-amber-600 dark:text-amber-300">
                                        Au rythme actuel, votre solde atteindra
                                        0 le{' '}
                                        <strong>
                                            {new Date(
                                                activeForecast.zero_balance_date,
                                            ).toLocaleDateString('fr-FR')}
                                        </strong>{' '}
                                        (dans {activeForecast.days_until_zero}{' '}
                                        jours).
                                    </p>
                                </div>
                            )}

                            {/* Recommandations */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Recommandations
                                </h3>
                                {activeForecast.recommendations.map(
                                    (rec, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                                        >
                                            <div className="mt-0.5 text-lg">
                                                💡
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {rec}
                                            </p>
                                        </motion.div>
                                    ),
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Historique */}
                    {activeTab === 'history' && history && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Statistiques */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Score Moyen Finance
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {history.statistics.avg_financial_score}
                                        %
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Score Moyen Tâches
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {history.statistics.avg_task_score}%
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        XP Net Total
                                    </div>
                                    <div
                                        className={`mt-1 text-2xl font-bold ${
                                            history.statistics.net_xp >= 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {history.statistics.net_xp >= 0
                                            ? '+'
                                            : ''}
                                        {history.statistics.net_xp}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="rounded-xl border border-gray-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                    Derniers {history.period.days} jours
                                </h3>
                                <div className="space-y-3">
                                    {history.snapshots
                                        .slice()
                                        .reverse()
                                        .map((snapshot, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-white/10"
                                            >
                                                <div className="shrink-0">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {new Date(
                                                            snapshot.date,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                            {
                                                                weekday:
                                                                    'short',
                                                                day: 'numeric',
                                                                month: 'short',
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                        <span>
                                                            Finance:{' '}
                                                            {
                                                                snapshot.financial_score
                                                            }
                                                            %
                                                        </span>
                                                        <span>
                                                            Tâches:{' '}
                                                            {
                                                                snapshot.task_score
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <div
                                                        className={`text-sm font-semibold ${
                                                            snapshot.net_xp >= 0
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {snapshot.net_xp >= 0
                                                            ? '+'
                                                            : ''}
                                                        {snapshot.net_xp} XP
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        +{snapshot.xp_gained} /
                                                        -{snapshot.xp_lost}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Animation de célébration */}
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
                                <div className="text-4xl font-bold text-white drop-shadow-lg">
                                    Excellent travail !
                                </div>
                                <div className="mt-2 text-xl text-white/90">
                                    Toutes vos tâches sont complétées 💪
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
