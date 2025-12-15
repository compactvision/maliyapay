import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Zap } from 'lucide-react';

interface DayPerformance {
    date: string;
    achieved: number;
    expected: number;
}

interface Props {
    data: DayPerformance[];
}

export const DayPerformanceCalendar: React.FC<Props> = ({ data }) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendrier d'Aventure
                </h3>
                <div className="text-xs text-muted-foreground font-medium">
                    {data.filter(d => d.achieved >= d.expected).length}/{data.length} jours complétés
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {days.map((d) => (
                    <div key={d} className="text-xs font-medium text-muted-foreground">
                        {d}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {data.map((day, i) => {
                    const completed = day.achieved >= day.expected;
                    const partial = day.achieved > 0 && day.achieved < day.expected;
                    
                    return (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                                'aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all duration-200',
                                completed
                                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
                                    : partial
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md'
                                    : 'bg-muted text-muted-foreground border border-border'
                            )}
                            title={`${day.date}: ${day.achieved}/${day.expected}`}
                        >
                            {completed ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : partial ? (
                                <div className="text-center">
                                    <div className="text-lg">{day.achieved}</div>
                                    <Zap className="h-3 w-3 mt-1" />
                                </div>
                            ) : (
                                <XCircle className="h-5 w-5" />
                            )}
                        </motion.div>
                    );
                })}
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-600"></div>
                    <span className="text-muted-foreground">Complété</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                    <span className="text-muted-foreground">Partiel</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted border border-border"></div>
                    <span className="text-muted-foreground">Manqué</span>
                </div>
            </div>
        </div>
    );
};