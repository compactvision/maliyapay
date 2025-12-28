import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface XPSuccessAnimationProps {
    isOpen: boolean;
    xpGained: number;
    onClose: () => void;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
}

export function XPSuccessAnimation({
    isOpen,
    xpGained,
    onClose,
}: XPSuccessAnimationProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Generate confetti particles
            const newParticles: Particle[] = Array.from(
                { length: 30 },
                (_, i) => ({
                    id: i,
                    x: Math.random() * 100 - 50,
                    y: Math.random() * -100 - 50,
                    color: [
                        '#fbbf24',
                        '#f59e0b',
                        '#10b981',
                        '#3b82f6',
                        '#8b5cf6',
                    ][Math.floor(Math.random() * 5)],
                    size: Math.random() * 8 + 4,
                    rotation: Math.random() * 360,
                }),
            );
            setParticles(newParticles);

            // Auto close after 2.5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Confetti Particles */}
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                rotate: particle.rotation,
                            }}
                            animate={{
                                x: particle.x * 4,
                                y: particle.y * 3,
                                opacity: 0,
                                rotate: particle.rotation + 360,
                            }}
                            transition={{
                                duration: 1.5,
                                ease: 'easeOut',
                            }}
                            className="absolute"
                            style={{
                                left: '50%',
                                top: '50%',
                                width: particle.size,
                                height: particle.size,
                                backgroundColor: particle.color,
                                borderRadius:
                                    Math.random() > 0.5 ? '50%' : '0%',
                            }}
                        />
                    ))}

                    {/* Main XP Badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                        }}
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow Effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-2xl"
                        />

                        {/* Badge Container */}
                        <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 shadow-2xl">
                            {/* Success Icon */}
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: 2,
                                    ease: 'easeInOut',
                                }}
                                className="rounded-full bg-white/20 p-4 backdrop-blur-sm"
                            >
                                <Sparkles className="h-12 w-12 text-white" />
                            </motion.div>

                            {/* Success Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <h3 className="text-2xl font-bold text-white">
                                    Bravo !
                                </h3>
                                <p className="text-sm text-white/90">
                                    Tâche terminée
                                </p>
                            </motion.div>

                            {/* XP Amount */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.3,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 shadow-lg"
                            >
                                <Zap className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                                <span className="text-3xl font-bold text-gray-900">
                                    +{xpGained}
                                </span>
                                <span className="text-lg font-semibold text-gray-600">
                                    XP
                                </span>
                            </motion.div>

                            {/* Floating Stars */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1, 0],
                                        y: [-20, -60],
                                        x: [0, (i - 1) * 30],
                                    }}
                                    transition={{
                                        delay: 0.5 + i * 0.1,
                                        duration: 1,
                                    }}
                                    className="absolute"
                                    style={{
                                        top: '20%',
                                        left: '50%',
                                    }}
                                >
                                    <Star className="h-6 w-6 fill-yellow-300 text-yellow-300" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
