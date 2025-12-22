import { PinPad } from '@/components/auth/PinPad';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Lock, LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UnlockScreenProps {
    onSuccess: () => void;
}

export function UnlockScreen({ onSuccess }: UnlockScreenProps) {
    const { user, unlockWithPin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(() => {
        return Number(localStorage.getItem('pin_failed_attempts')) || 0;
    });
    const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
        const stored = localStorage.getItem('pin_locked_until');
        return stored ? Number(stored) : null;
    });
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [pinPadKey, setPinPadKey] = useState(0);

    const calculateDelay = (attempts: number) => {
        if (attempts === 3) return 30; // 30 seconds
        if (attempts === 4) return 60; // 1 minute
        if (attempts === 5) return 300; // 5 minutes
        if (attempts >= 6) return 900; // 15 minutes
        return 0;
    };

    // Gestion du compte à rebours
    useEffect(() => {
        if (!lockedUntil) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.ceil((lockedUntil - now) / 1000);

            if (diff <= 0) {
                setLockedUntil(null);
                localStorage.removeItem('pin_locked_until');
                setRemainingTime(0);
                clearInterval(interval);
            } else {
                setRemainingTime(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockedUntil]);

    // Empêcher le scroll de la page lorsque l'écran de déverrouillage est affiché
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleUnlock = async (pin: string) => {
        if (lockedUntil && Date.now() < lockedUntil) {
            setError(`Veuillez attendre ${remainingTime} secondes.`);
            setPinPadKey((prev) => prev + 1);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await unlockWithPin(pin);
            // Success: Reset everything
            setFailedAttempts(0);
            setLockedUntil(null);
            localStorage.removeItem('pin_failed_attempts');
            localStorage.removeItem('pin_locked_until');
            onSuccess();
        } catch (err) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            localStorage.setItem('pin_failed_attempts', String(newAttempts));

            if (newAttempts >= 3) {
                const delay = calculateDelay(newAttempts);
                const unlockTime = Date.now() + delay * 1000;
                setLockedUntil(unlockTime);
                localStorage.setItem('pin_locked_until', String(unlockTime));
                setError(`Trop de tentatives. Réessayez dans ${delay}s.`);
            } else {
                setError(
                    err instanceof Error ? err.message : 'Code PIN incorrect',
                );
            }
            // Reset PinPad component
            setPinPadKey((prev) => prev + 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-2xl"
        >
            {/* Animated Background Orbs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -60, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]"
                />
            </div>

            {/* Conteneur principal (la "carte") */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl"
                style={{ height: 'calc(100vh - 2rem)' }} // Prend toute la hauteur sur mobile, moins le padding
            >
                {/* Zone de contenu défilable */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                        {/* Icône et Titre */}
                        <div className="text-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-emerald-400 to-sky-400 shadow-2xl ring-4 shadow-emerald-500/30 ring-white/10 sm:mb-6 sm:h-24 sm:w-24"
                            >
                                <Lock className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                            </motion.div>
                            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                Continuer
                            </h1>
                            <p className="text-sm text-slate-400 sm:text-base">
                                Votre session est protégée
                            </p>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="flex w-full flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:rounded-3xl sm:p-6">
                            <div className="relative">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        className="h-16 w-16 rounded-xl border-2 border-emerald-500/50 object-cover p-1 shadow-2xl sm:h-20 sm:w-20 sm:rounded-2xl"
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white shadow-2xl sm:h-20 sm:w-20 sm:rounded-2xl">
                                        <UserIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                                    </div>
                                )}
                                <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-950 bg-emerald-500 sm:h-5 sm:w-5" />
                            </div>
                            <div className="mt-3 text-center sm:mt-4">
                                <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                                    {user?.name}
                                </p>
                                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* PinPad */}
                        <div className="w-full">
                            <PinPad
                                key={pinPadKey}
                                onComplete={handleUnlock}
                                isLoading={
                                    isLoading ||
                                    (!!lockedUntil && Date.now() < lockedUntil)
                                }
                                error={error}
                            />
                        </div>
                    </div>
                </div>

                {/* Pied de page fixe pour le bouton "Changer de compte" */}
                <div className="border-t border-white/5 bg-slate-900/80 p-4 backdrop-blur-xl sm:p-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth_token');
                            window.location.href = '/login';
                        }}
                        className="group mx-auto flex items-center justify-center gap-2 text-sm text-slate-500 transition-all hover:text-white"
                    >
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Changer de compte
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
