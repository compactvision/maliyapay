import { AnimatePresence, motion } from 'framer-motion';
import { Delete, Eraser } from 'lucide-react';
import { useState } from 'react';

interface PinPadProps {
    onComplete: (pin: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

export function PinPad({ onComplete, isLoading, error }: PinPadProps) {
    const [pin, setPin] = useState<string[]>([]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = [...pin, num];
            setPin(newPin);
            if (newPin.length === 4) {
                onComplete(newPin.join(''));
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        setPin([]);
    };

    const numbers = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
    ];

    return (
        <div className="flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 w-full">
            {/* PIN Display - Dots */}
            <div className="flex justify-center space-x-4 sm:space-x-6">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: pin.length > i ? 1.2 : 1,
                            backgroundColor:
                                pin.length > i
                                    ? '#10b981'
                                    : 'rgba(255,255,255,0.1)',
                        }}
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0)] transition-shadow duration-300"
                        style={{
                            boxShadow:
                                pin.length > i
                                    ? '0 0 15px rgba(16,185,129,0.3)'
                                    : 'none',
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0, x: [0, -5, 5, -5, 5, 0] }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-semibold text-rose-500 text-center"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-xs sm:max-w-md">
                {numbers.map((row) =>
                    row.map((num) => (
                        <motion.button
                            key={num}
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            }}
                            whileTap={{
                                scale: 0.9,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                            }}
                            onClick={() => handleNumberClick(num)}
                            disabled={isLoading}
                            className="flex h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 bg-white/5 text-2xl sm:text-3xl font-medium text-white shadow-xl transition-colors outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 mx-auto"
                        >
                            {num}
                        </motion.button>
                    )),
                )}

                {/* Bottom Row */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClear}
                    disabled={isLoading || pin.length === 0}
                    className="flex h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-2xl sm:rounded-3xl text-slate-500 transition-colors hover:text-rose-400 disabled:opacity-0 mx-auto"
                >
                    <Eraser className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </motion.button>

                <motion.button
                    whileHover={{
                        scale: 1.05,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                    whileTap={{
                        scale: 0.9,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                    }}
                    onClick={() => handleNumberClick('0')}
                    disabled={isLoading}
                    className="flex h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 bg-white/5 text-2xl sm:text-3xl font-medium text-white shadow-xl outline-none focus:ring-2 focus:ring-emerald-500/30 mx-auto"
                >
                    0
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    disabled={isLoading || pin.length === 0}
                    className="flex h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-2xl sm:rounded-3xl text-slate-500 transition-colors hover:text-emerald-400 disabled:opacity-0 mx-auto"
                >
                    <Delete className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </motion.button>
            </div>
        </div>
    );
}