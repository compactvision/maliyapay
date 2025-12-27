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
import { useEffect, useRef, useState } from 'react';

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
    const [isShaking, setIsShaking] = useState<string | null>(null);

    // Configuration
    const verticalSpacing = 180; 
    const horizontalAmplitude = 35; 
    const paddingTop = 100;
    const totalMapHeight = business.steps.length * verticalSpacing + 300;

    const getLevelPosition = (index: number) => {
        const y = index * verticalSpacing + paddingTop;
        const x = 50 + horizontalAmplitude * Math.sin((index / 2) * Math.PI);
        return { x, y };
    };

    const generatePath = () => {
        const points = business.steps.map((_, index) => getLevelPosition(index));
        if (points.length < 2) return '';

        let path = `M ${points[0].x}% ${points[0].y}px`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const midY = (prev.y + curr.y) / 2;
            path += ` C ${prev.x}% ${midY}px, ${curr.x}% ${midY}px, ${curr.x}% ${curr.y}px`;
        }
        return path;
    };

    const generateProgressPath = () => {
        const completedSteps = business.steps.filter((s) => s.completed);
        if (completedSteps.length < 1) return '';

        const points = business.steps
            .map((_, index) => getLevelPosition(index))
            .slice(0, completedSteps.length + 1);

        if (points.length < 2) return '';

        let path = `M ${points[0].x}% ${points[0].y}px`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const midY = (prev.y + curr.y) / 2;
            path += ` C ${prev.x}% ${midY}px, ${curr.x}% ${midY}px, ${curr.x}% ${curr.y}px`;
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

    useEffect(() => {
        if (mapRef.current && currentLevelIndex >= 0) {
            const levelElements = mapRef.current.querySelectorAll('[data-level]');
            const currentElement = levelElements[currentLevelIndex];
            if (currentElement) {
                setTimeout(() => {
                    currentElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    });
                }, 500);
            }
        }
    }, [currentLevelIndex]);

    const getCompletionPercentage = () => {
        const completed = business.steps.filter((s) => s.completed).length;
        return Math.round((completed / business.steps.length) * 100);
    };

    const handleStepClick = (step: Level, index: number) => {
        const isLocked = !step.completed && index !== currentLevelIndex;
        
        if (isLocked) {
            setIsShaking(step.id);
            setTimeout(() => setIsShaking(null), 500);
        } else {
            onStepClick(step);
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-20 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 backdrop-blur-sm"
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
            <div className="relative overflow-hidden rounded-3xl border-4 border-emerald-500/30 bg-emerald-500/[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner shadow-emerald-500/10">
                
                <div
                    ref={mapRef}
                    className="custom-scrollbar relative overflow-y-auto overflow-x-visible p-4 md:p-8"
                    style={{ height: '75vh', maxHeight: '800px' }}
                >
                    <div
                        className="relative mx-auto"
                        style={{
                            height: `${totalMapHeight}px`,
                            width: '100%',
                            maxWidth: '700px',
                        }}
                    >
                        {/* SVG Layer */}
                        <svg
                            className="pointer-events-none absolute inset-0 h-full w-full"
                            style={{ overflow: 'visible', zIndex: 0 }}
                        >
                            <defs>
                                {/* Effet de lueur (Glow) pour la ligne active */}
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>

                                {/* Gradient Ligne SOMBRE (Chemin restant) */}
                                <linearGradient id="darkPath" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#334155" stopOpacity="1" /> {/* Slate 700 */}
                                    <stop offset="100%" stopColor="#1e293b" stopOpacity="1" /> {/* Slate 800 */}
                                </linearGradient>

                                {/* Gradient Ligne CLAIRE (Chemin accompli) */}
                                <linearGradient id="brightPath" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity="1" /> {/* Emerald 400 */}
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="1" /> {/* Emerald 500 */}
                                </linearGradient>
                            </defs>
                            
                            {/* 1. Le chemin de fond (SOMBRE) - Relie TOUTES les étapes */}
                            <path
                                d={generatePath()}
                                fill="none"
                                stroke="url(#darkPath)"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />
                            
                            {/* 2. Le chemin de progression (CLAIREF + LUMINEUX) - Relie les étapes finies */}
                            <motion.path
                                d={generateProgressPath()}
                                fill="none"
                                stroke="url(#brightPath)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                filter="url(#glow)" // Applique la lueur
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                            />
                            
                            {/* 3. Animation d'énergie sur la ligne active */}
                            {generateProgressPath() && (
                                <motion.path
                                    d={generateProgressPath()}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeDasharray="0 25"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 2,
                                        ease: 'linear',
                                        repeat: Infinity,
                                    }}
                                    className="opacity-70"
                                />
                            )}
                        </svg>

                        {/* Nodes Layer */}
                        <div className="relative w-full" style={{ zIndex: 10 }}>
                            {business.steps.map((step, index) => {
                                const position = getLevelPosition(index);
                                const isCompleted = step.completed;
                                const isCurrent = index === currentLevelIndex;
                                const isLocked = !isCompleted && !isCurrent;
                                const Icon = LEVEL_ICONS[index % LEVEL_ICONS.length];
                                
                                // Logique anti-débordement pour le tooltip
                                let showTooltipRight = position.x < 30; 
                                let showTooltipLeft = position.x > 70;

                                if (!showTooltipRight && !showTooltipLeft) {
                                    showTooltipRight = position.x > 50;
                                    showTooltipLeft = !showTooltipRight;
                                }

                                return (
                                    <motion.div
                                        key={step.id}
                                        data-level={index}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ 
                                            scale: isShaking === step.id ? [1, 0.9, 1.1, 1] : 1, 
                                            opacity: 1 
                                        }}
                                        transition={{
                                            scale: { duration: 0.4 },
                                            delay: index * 0.15,
                                            type: 'spring',
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: `${position.x}%`,
                                            top: `${position.y}px`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                        className="group flex items-center justify-center"
                                    >
                                        {/* Tooltip Horizontal */}
                                        <div 
                                            className={`absolute top-1/2 w-48 p-3 rounded-xl border bg-background/95 backdrop-blur-md shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20 ${
                                                showTooltipLeft ? 'right-full mr-4 -translate-y-1/2' : 'left-full ml-4 -translate-y-1/2'
                                            }`}
                                        >
                                            <div className={`absolute top-1/2 -translate-y-1/2 border-8 border-transparent ${showTooltipLeft ? 'right-[-16px] border-l-background' : 'left-[-16px] border-r-background'}`}></div>
                                            
                                            <div className="flex items-center gap-2 mb-1">
                                                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Étape {index + 1}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-foreground text-sm mb-1">{step.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                                                {step.description}
                                            </p>
                                            {step.isPaid && (
                                                <div className="mt-2 inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                                                    <Coins className="h-3 w-3" />
                                                    Payant
                                                </div>
                                            )}
                                        </div>

                                        {/* Level Node */}
                                        <motion.button
                                            onClick={() => handleStepClick(step, index)}
                                            disabled={isLocked}
                                            whileHover={!isLocked ? { scale: 1.1 } : {}}
                                            whileTap={!isLocked ? { scale: 0.95 } : {}}
                                            className={`relative transition-all duration-300 outline-none ${
                                                isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                                            }`}
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
                                                          : 'border-slate-600 bg-slate-800/50 grayscale'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                                ) : isLocked ? (
                                                    <Lock className="h-8 w-8 text-slate-400/50" />
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
                                                              : 'border-slate-600 bg-slate-700 text-slate-300'
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
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};