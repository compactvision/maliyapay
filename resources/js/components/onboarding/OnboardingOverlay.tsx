import { AuthContext } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';

const STEPS = [
    {
        title: 'Bienvenue sur Maliyaflow',
        description:
            "L'avenir de votre gestion financière commence ici. Une interface fluide, intelligente et sécurisée.",
        image: '/images/onboarding/step1.png',
        color: 'from-purple-600/40 via-blue-600/20 to-transparent',
    },
    {
        title: 'Suivez votre Croissance',
        description:
            "Visualisez vos progrès en temps réel avec nos tableaux de bord ultra-modernes. Vos chiffres n'ont jamais été aussi clairs.",
        image: '/images/onboarding/step2.png',
        color: 'from-emerald-600/40 via-teal-600/20 to-transparent',
    },
    {
        title: 'Maîtrisez votre Routine',
        description:
            'Organisez vos journées avec précision. Vos tâches et vos habitudes se synchronisent pour une productivité maximale.',
        image: '/images/onboarding/step3.png',
        color: 'from-orange-600/40 via-red-600/20 to-transparent',
    },
    {
        title: 'Alertes Intelligentes',
        description:
            "Restez connecté à l'essentiel. Nos notifications intelligentes vous informent au bon moment, sans effort.",
        image: '/images/onboarding/step4.png',
        color: 'from-blue-600/40 via-indigo-600/20 to-transparent',
    },
];

export const OnboardingOverlay: React.FC = () => {
    const auth = useContext(AuthContext);
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const storageKey = auth?.user?.id
        ? `maliyaflow_onboarded_user_${auth.user.id}`
        : 'maliyaflow_onboarded_guest';

    useEffect(() => {
        if (auth?.isAuthenticated && auth?.user && !isVisible) {
            const hasOnboardedLocally = localStorage.getItem(storageKey);
            const hasOnboardedOnBackend = !!auth.user.onboarded_at;

            if (!hasOnboardedLocally && !hasOnboardedOnBackend) {
                // Small delay for better UX after login
                const timer = setTimeout(() => setIsVisible(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [auth?.isAuthenticated, auth?.user?.onboarded_at, storageKey]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem(storageKey, 'true');
        auth?.completeOnboarding();
        setIsVisible(false);
    };

    if (!isVisible || !auth?.isAuthenticated) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 backdrop-blur-2xl"
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className={`absolute -top-1/4 -right-1/4 h-full w-full rounded-full bg-gradient-to-br blur-[120px] transition-colors duration-1000 ${STEPS[currentStep].color}`}
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className={`absolute -bottom-1/4 -left-1/4 h-full w-full rounded-full bg-gradient-to-tr blur-[120px] transition-colors duration-1000 ${STEPS[currentStep].color}`}
                    />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="relative w-full max-w-xl overflow-hidden rounded-[3rem] border border-white/20 bg-zinc-950/50 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-md"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 right-0 left-0 z-20 flex h-1 gap-2 p-6">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className="relative h-full flex-1 overflow-hidden rounded-full bg-white/10"
                            >
                                <motion.div
                                    initial={false}
                                    animate={{
                                        width:
                                            idx <= currentStep ? '100%' : '0%',
                                        opacity: idx <= currentStep ? 1 : 0,
                                    }}
                                    className="absolute inset-0 bg-white"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleComplete}
                        className="absolute top-8 right-8 z-20 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{
                                    opacity: 0,
                                    scale: 1.2,
                                    filter: 'blur(10px)',
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    filter: 'blur(0px)',
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                    filter: 'blur(10px)',
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="h-full w-full"
                            >
                                <img
                                    src={STEPS[currentStep].image}
                                    alt={STEPS[currentStep].title}
                                    className="h-full w-full object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    </div>

                    <div className="relative p-10 pt-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="space-y-6"
                            >
                                <h2 className="text-4xl font-bold tracking-tight text-white">
                                    {STEPS[currentStep].title}
                                </h2>
                                <p className="text-xl leading-relaxed font-light text-zinc-300">
                                    {STEPS[currentStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 flex items-center justify-between">
                            <button
                                onClick={handleComplete}
                                className="text-base font-medium text-zinc-500 transition-colors hover:text-white"
                            >
                                Passer l'intro
                            </button>

                            <Button
                                onClick={handleNext}
                                size="lg"
                                className="group h-16 rounded-[1.5rem] bg-white px-10 text-xl font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 active:scale-95"
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    'Commencer'
                                ) : (
                                    <>
                                        Suivant
                                        <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
