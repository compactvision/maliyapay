import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Target, Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuestIntroBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    business: {
        title: string;
        description: string;
        difficulty: string;
        potential: string;
        steps: Array<{
            id: string;
            title: string;
            description: string;
        }>;
    };
}

export const QuestIntroBottomSheet = ({
    isOpen,
    onClose,
    onStart,
    business,
}: QuestIntroBottomSheetProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const introText = `Bienvenue dans la quête ${business.title}! Je suis votre guide dans cette aventure entrepreneuriale. Ensemble, nous allons transformer votre vision en réalité à travers ${business.steps.length} étapes stratégiques. Êtes-vous prêt à relever le défi?`;

    useEffect(() => {
        if (isOpen) {
            setDisplayedText('');
            setIsTyping(true);
            let currentIndex = 0;

            const typingInterval = setInterval(() => {
                if (currentIndex < introText.length) {
                    setDisplayedText(introText.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    setIsTyping(false);
                    clearInterval(typingInterval);
                }
            }, 30);

            return () => clearInterval(typingInterval);
        }
    }, [isOpen, introText]);

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

                            {/* Character Avatar */}
                            <div className="mb-6 flex justify-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg ring-4 ring-emerald-500/20">
                                        <Trophy className="h-12 w-12 text-white" />
                                    </div>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Sparkles className="h-6 w-6 text-yellow-400" />
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-4 text-center text-2xl font-bold text-foreground md:text-3xl"
                            >
                                Quête: {business.title}
                            </motion.h2>

                            {/* Difficulty & Potential Badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-6 flex justify-center gap-3"
                            >
                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <Target className="h-4 w-4" />
                                    {business.difficulty}
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                                    <Sparkles className="h-4 w-4" />
                                    Potentiel {business.potential}
                                </div>
                            </motion.div>

                            {/* Typewriter Text */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mb-6 rounded-xl bg-muted/50 p-4 md:p-6"
                            >
                                <p className="text-center text-base leading-relaxed text-foreground md:text-lg">
                                    {displayedText}
                                    {isTyping && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: Infinity,
                                            }}
                                            className="ml-1 inline-block h-5 w-0.5 bg-emerald-500"
                                        />
                                    )}
                                </p>
                            </motion.div>

                            {/* Objectives Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mb-6"
                            >
                                <h3 className="mb-3 text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Vos Objectifs
                                </h3>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {business.steps
                                        .slice(0, 4)
                                        .map((step, index) => (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.8 + index * 0.1,
                                                }}
                                                className="flex items-center gap-2 rounded-lg bg-background p-2 text-sm"
                                            >
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {index + 1}
                                                </div>
                                                <span className="text-muted-foreground">
                                                    {step.title}
                                                </span>
                                            </motion.div>
                                        ))}
                                    {business.steps.length > 4 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                            className="flex items-center justify-center text-sm text-muted-foreground"
                                        >
                                            +{business.steps.length - 4} autres
                                            étapes...
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Action Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                            >
                                <Button
                                    onClick={onStart}
                                    disabled={isTyping}
                                    className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-lg font-bold text-white shadow-lg transition-all hover:shadow-emerald-500/50 disabled:opacity-50"
                                >
                                    <motion.div
                                        animate={{
                                            x: isTyping ? [0, 100, 0] : 0,
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: isTyping ? Infinity : 0,
                                        }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isTyping ? (
                                            'Préparation...'
                                        ) : (
                                            <>
                                                Commencer l'Aventure
                                                <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
