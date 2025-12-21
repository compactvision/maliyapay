import { PinPad } from '@/components/auth/PinPad';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Lock, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

interface UnlockScreenProps {
    onSuccess: () => void;
}

export function UnlockScreen({ onSuccess }: UnlockScreenProps) {
    const { user, unlockWithPin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUnlock = async (pin: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await unlockWithPin(pin);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Code PIN incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-2xl"
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

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md p-8 text-center"
            >
                <div className="mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-emerald-400 to-sky-400 shadow-2xl ring-4 shadow-emerald-500/30 ring-white/10"
                    >
                        <Lock className="h-10 w-10 text-white" />
                    </motion.div>

                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white">
                        Continuer
                    </h1>
                    <p className="text-slate-400">Votre session est protégée</p>
                </div>

                {/* User Info with subtle card feel */}
                <div className="mb-10 flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <div className="relative">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                className="h-20 w-20 rounded-2xl border-2 border-emerald-500/50 object-cover p-1 shadow-2xl"
                                alt={user.name}
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-2xl">
                                <UserIcon className="h-10 w-10" />
                            </div>
                        )}
                        <div className="absolute -right-1 -bottom-1 h-5 w-5 animate-pulse rounded-full border-2 border-slate-950 bg-emerald-500" />
                    </div>

                    <div className="mt-4">
                        <p className="text-xl font-bold tracking-tight text-white">
                            {user?.name}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <PinPad
                        onComplete={handleUnlock}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>

                <div className="mt-10">
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
