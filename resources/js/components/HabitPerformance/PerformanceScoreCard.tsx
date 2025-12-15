import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Minus, TrendingDown, TrendingUp, Zap, Shield, Heart } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface Props {
    title: string;
    score: number;
    summary: string;
    type: 'task' | 'finance';
}

export const PerformanceScoreCard: React.FC<Props> = ({
    title,
    score,
    summary,
    type,
}) => {
    let colorClass = 'text-muted-foreground';
    let bgClass = 'bg-muted';
    let progressBg = 'bg-muted';
    let progressFg = 'bg-primary';
    let Icon = Minus;
    let emoji = "😐";

    if (score >= 80) {
        colorClass = 'text-green-500 dark:text-green-400';
        bgClass = 'bg-green-100 dark:bg-green-900/30';
        progressBg = 'bg-green-100 dark:bg-green-900/30';
        progressFg = 'bg-green-500 dark:bg-green-600';
        Icon = TrendingUp;
        emoji = "🚀";
    } else if (score >= 50) {
        colorClass = 'text-yellow-500 dark:text-yellow-400';
        bgClass = 'bg-yellow-100 dark:bg-yellow-900/30';
        progressBg = 'bg-yellow-100 dark:bg-yellow-900/30';
        progressFg = 'bg-yellow-500 dark:bg-yellow-600';
        Icon = Minus;
        emoji = "💪";
    } else {
        colorClass = 'text-red-500 dark:text-red-400';
        bgClass = 'bg-red-100 dark:bg-red-900/30';
        progressBg = 'bg-red-100 dark:bg-red-900/30';
        progressFg = 'bg-red-500 dark:bg-red-600';
        Icon = TrendingDown;
        emoji = "🔥";
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <Card className={`h-full overflow-hidden border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
                type === 'task' 
                    ? 'border-blue-200 dark:border-blue-800' 
                    : 'border-green-200 dark:border-green-800'
            }`}>
                <CardHeader className={`pb-2 ${
                    type === 'task' 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                }`}>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className="text-lg">{emoji}</span>
                            <span className="text-foreground">{title}</span>
                        </CardTitle>
                        <div className={`rounded-full p-1.5 ${bgClass}`}>
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-foreground">{score}</div>
                        <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{summary}</p>
                    <div className="mt-4">
                        <Progress 
                            value={score} 
                            className={`h-3 ${progressBg}`}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {type === 'task' ? (
                                <>
                                    <Zap className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-foreground">Énergie</span>
                                </>
                            ) : (
                                <>
                                    <Heart className="h-3 w-3 text-green-500 dark:text-green-400" />
                                    <span className="text-xs font-medium text-foreground">Santé</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs font-medium text-foreground">Niveau {Math.floor(score / 20) + 1}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};