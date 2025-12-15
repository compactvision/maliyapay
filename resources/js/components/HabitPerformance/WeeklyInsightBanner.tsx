import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Sparkles } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    message: string;
}

export const WeeklyInsightBanner: React.FC<Props> = ({ message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 shadow-lg"
        >
            <div className="absolute top-0 right-0 opacity-20">
                <Sparkles className="h-16 w-16 text-amber-500 dark:text-amber-400" />
            </div>
            
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500 dark:bg-amber-600 p-2 text-white">
                    <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-200">Conseil du Coach</h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{message}</p>
                </div>
            </div>
        </motion.div>
    );
};