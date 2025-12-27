import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Coins,
    MapPin,
    Play,
    Star,
    Target,
    Trophy,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuestLevelDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    step: any; // Using any for now to match flexible structure, ideally define Step interface
    index: number;
}

export const QuestLevelDetailSheet = ({
    isOpen,
    onClose,
    onStart,
    step,
    index,
}: QuestLevelDetailSheetProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    // Provide a default description if missing
    const descriptionText =
        step?.description ||
        'Préparez-vous à relever ce nouveau défi. Je vais vous guider à travers les concepts clés pour maîtriser cette étape.';

    // Reset typing effect when sheet opens or step changes
    useEffect(() => {
        if (isOpen && step) {
            setDisplayedText('');
            setIsTyping(true);
            let currentIndex = 0;

            const typingInterval = setInterval(() => {
                if (currentIndex < descriptionText.length) {
                    setDisplayedText(
                        descriptionText.slice(0, currentIndex + 1),
                    );
                    currentIndex++;
                } else {
                    setIsTyping(false);
                    clearInterval(typingInterval);
                }
            }, 30); // Speed of typing

            return () => clearInterval(typingInterval);
        }
    }, [isOpen, step, descriptionText]);

    if (!step) return null;

    const isLocked = step.locked;

    // Helper to format currency/cost
    const formatCost = (costs: any[]) => {
        if (!costs || costs.length === 0) return 'Gratuit';
        return costs.map((c) => `${c.amount} ${c.unit || ''}`).join(' + ');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl"
                    >
                        <div className="relative rounded-t-3xl border-t-4 border-emerald-500 bg-background p-6 shadow-2xl md:p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Guide Avatar & Header */}
                            <div className="mb-6 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                    className="relative mb-4"
                                >
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-4 ring-indigo-500/20">
                                        <BookOpen className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-md">
                                        {index + 1}
                                    </div>
                                </motion.div>

                                <h2 className="text-3xl font-bold text-foreground">
                                    {step.title}
                                </h2>
                                {step.completed && (
                                    <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Terminé
                                    </div>
                                )}
                            </div>

                            {/* Typing Speech Bubble */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative mb-8 rounded-2xl rounded-tl-none bg-muted/60 p-5 shadow-sm"
                            >
                                <div
                                    className="absolute -top-2 left-0 h-4 w-4 bg-muted/60"
                                    style={{
                                        clipPath:
                                            'polygon(0 0, 0 100%, 100% 100%)',
                                    }}
                                ></div>
                                <p className="text-base leading-relaxed text-foreground/90">
                                    {displayedText}
                                    {isTyping && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: Infinity,
                                            }}
                                            className="ml-1 inline-block h-4 w-0.5 bg-indigo-500 align-middle"
                                        />
                                    )}
                                </p>
                            </motion.div>

                            {/* Key Info Cards */}
                            <div className="mb-8 grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 transition-colors hover:bg-blue-500/10">
                                    <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Target className="h-5 w-5" />
                                        <span className="text-xs font-bold tracking-wider uppercase">
                                            Objectif
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80">
                                        {step.objective ||
                                            'Atteindre 100% de complétion.'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10">
                                    <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                        <Trophy className="h-5 w-5" />
                                        <span className="text-xs font-bold tracking-wider uppercase">
                                            Récompenses
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                            <span>
                                                {step.progression?.xpReward ||
                                                    100}{' '}
                                                XP
                                            </span>
                                        </div>
                                        {step.progression?.nextLevelUnlock && (
                                            <div className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    Unlock Lvl {index + 2}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Preview (Minimalist) */}
                            <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>
                                        {step.knowledge?.title
                                            ? '1 Module'
                                            : 'Pas de cours'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                                    <Play className="h-3.5 w-3.5" />
                                    <span>
                                        {step.actions?.steps?.length || 0}{' '}
                                        Actions
                                    </span>
                                </div>
                                {step.costs && step.costs.length > 0 && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                                        <Coins className="h-3.5 w-3.5" />
                                        <span>{formatCost(step.costs)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <Button
                                onClick={onStart}
                                disabled={isTyping}
                                className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-lg font-bold text-white shadow-lg transition-all hover:shadow-emerald-500/50 disabled:opacity-70"
                            >
                                <span className="flex items-center gap-2">
                                    {step.completed
                                        ? 'Revoir le niveau'
                                        : "Commencer l'étape"}
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
