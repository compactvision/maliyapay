import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Coins,
    Lock,
    Sparkles,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Level {
    id: string;
    title: string;
    description: string;
    completed?: boolean;
    level?: number;
    isPaid?: boolean;
    priceAmount?: number;
}

interface QuestGameMapProps {
    business: {
        id: string;
        title: string;
        steps: Level[];
    };
    onCompleteStep: (businessId: string, stepId: string) => void;
    onStepClick: (step: Level) => void;
}

const LEVEL_ICONS = [Target, Zap, Star, Trophy, Sparkles];

export const QuestGameMap = ({
    business,
    onCompleteStep,
    onStepClick,
}: QuestGameMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);

    // Calculate path positions for levels (winding path)
    const getLevelPosition = (index: number, total: number) => {
        // Vertical spacing - at least 150px between nodes
        const y = index * 180 + 100;

        // Winding horizontal oscillation
        const amplitude = 35; // How far it swings in %
        const frequency = 0.5;
        const x = 50 + amplitude * Math.sin((index / 2) * Math.PI);

        return { x, y };
    };

    // Generate SVG path with curves
    const generatePath = () => {
        const points = business.steps.map((_, index) =>
            getLevelPosition(index, business.steps.length),
        );

        if (points.length < 2) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const midY = (prev.y + curr.y) / 2;
            path += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
        }

        return path;
    };

    // Generate progress path (only for completed steps)
    const generateProgressPath = () => {
        const completedSteps = business.steps.filter((s) => s.completed);
        if (completedSteps.length < 1) return '';

        const points = business.steps
            .map((_, index) => getLevelPosition(index, business.steps.length))
            .slice(0, completedSteps.length + 1);

        if (points.length < 2) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const midY = (prev.y + curr.y) / 2;
            path += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
        }

        return path;
    };

    const getCurrentLevelIndex = () => {
        return business.steps.findIndex(
            (step, index) =>
                !step.completed &&
                (index === 0 || business.steps[index - 1].completed),
        );
    };

    const currentLevelIndex = getCurrentLevelIndex();

    // Scroll to current level on mount
    useEffect(() => {
        if (mapRef.current && currentLevelIndex >= 0) {
            const levelElements =
                mapRef.current.querySelectorAll('[data-level]');
            const currentElement = levelElements[currentLevelIndex];
            if (currentElement) {
                currentElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [currentLevelIndex]);

    const getCompletionPercentage = () => {
        const completed = business.steps.filter((s) => s.completed).length;
        return Math.round((completed / business.steps.length) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-10 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">
                            {business.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Niveau {currentLevelIndex + 1} sur{' '}
                            {business.steps.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {getCompletionPercentage()}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Progression
                        </p>
                    </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getCompletionPercentage()}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                </div>
            </motion.div>

            {/* Game Map Container */}
            <div
                ref={mapRef}
                className="custom-scrollbar relative overflow-x-hidden overflow-y-auto rounded-3xl border-4 border-emerald-500/30 bg-emerald-500/[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] p-8 shadow-inner shadow-emerald-500/10"
                style={{ height: '700px' }}
            >
                <div
                    className="relative"
                    style={{
                        height: `${business.steps.length * 180 + 200}px`,
                        width: '100%',
                    }}
                >
                    {/* SVG Path */}
                    <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        style={{ overflow: 'visible' }}
                    >
                        <defs>
                            <linearGradient
                                id="pathGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(16, 185, 129)"
                                    stopOpacity="0.2"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(20, 184, 166)"
                                    stopOpacity="0.2"
                                />
                            </linearGradient>
                            <linearGradient
                                id="progressGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(34, 197, 94)"
                                    stopOpacity="0.8"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(16, 185, 129)"
                                    stopOpacity="0.8"
                                />
                            </linearGradient>
                        </defs>
                        {/* Base path - full route */}
                        <motion.path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                            className="opacity-50"
                        />
                        {/* Progress path - completed sections */}
                        <motion.path
                            d={generateProgressPath()}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 1.5,
                                ease: 'easeOut',
                                delay: 0.5,
                            }}
                        />
                        {/* Animated dots on progress path */}
                        {generateProgressPath() && (
                            <motion.path
                                d={generateProgressPath()}
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="0 20"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 2,
                                    ease: 'linear',
                                    repeat: Infinity,
                                }}
                                className="opacity-60"
                            />
                        )}
                    </svg>

                    {/* Level Nodes */}
                    <div className="relative">
                        {business.steps.map((step, index) => {
                            const position = getLevelPosition(
                                index,
                                business.steps.length,
                            );
                            const isCompleted = step.completed;
                            const isCurrent = index === currentLevelIndex;
                            const isLocked = !isCompleted && !isCurrent;
                            const Icon =
                                LEVEL_ICONS[index % LEVEL_ICONS.length];

                            return (
                                <motion.div
                                    key={step.id}
                                    data-level={index}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.15,
                                        type: 'spring',
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: `${position.x}%`,
                                        top: `${position.y}px`,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 2,
                                    }}
                                    className="group"
                                >
                                    {/* Level Node */}
                                    <motion.div
                                        whileHover={
                                            !isLocked ? { scale: 1.1 } : {}
                                        }
                                        whileTap={
                                            !isLocked ? { scale: 0.95 } : {}
                                        }
                                        onClick={() => onStepClick(step)}
                                        className={`relative transition-all duration-300 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {/* Glow Effect for Current Level */}
                                        {isCurrent && (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.5, 0.8, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                                className="absolute inset-0 rounded-full bg-emerald-500 blur-xl"
                                            />
                                        )}

                                        {/* Node Circle */}
                                        <div
                                            className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-lg transition-all ${
                                                isCompleted
                                                    ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600'
                                                    : isCurrent
                                                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-500/30'
                                                      : 'border-muted bg-muted/50 grayscale'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-10 w-10 text-white" />
                                            ) : isLocked ? (
                                                <Lock className="h-8 w-8 text-muted-foreground/50" />
                                            ) : step.isPaid ? (
                                                <Coins className="h-9 w-9 animate-pulse text-amber-300" />
                                            ) : (
                                                <Icon className="h-9 w-9 text-white" />
                                            )}

                                            {/* Level Number Badge */}
                                            <div
                                                className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                                                    isCompleted
                                                        ? 'border-green-600 bg-green-500 text-white'
                                                        : isCurrent
                                                          ? 'border-emerald-600 bg-emerald-500 text-white'
                                                          : 'border-muted bg-background text-muted-foreground'
                                                }`}
                                            >
                                                {index + 1}
                                            </div>

                                            {/* Sparkle Animation for Completed */}
                                            {isCompleted && (
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 360],
                                                        scale: [1, 1.2, 1],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                    className="absolute -top-3 -left-3"
                                                >
                                                    <Sparkles className="h-5 w-5 text-yellow-400" />
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Level Title Tooltip */}
                                        <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="rounded-lg bg-background px-3 py-1.5 text-xs font-medium shadow-lg ring-1 ring-border">
                                                {step.title}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
