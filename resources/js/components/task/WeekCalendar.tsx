import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    addDays,
    format,
    isSameDay,
    isToday,
    startOfWeek,
    subDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, PanInfo } from 'framer-motion';
import { Award, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface WeekCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    taskCounts?: Record<string, number>; // date string -> count
}

export function WeekCalendar({
    selectedDate,
    onDateSelect,
    taskCounts = {},
}: WeekCalendarProps) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const [swipeDirection, setSwipeDirection] = useState<
        'left' | 'right' | null
    >(null);

    const handlePrevWeek = () => {
        onDateSelect(subDays(selectedDate, 7));
    };

    const handleNextWeek = () => {
        onDateSelect(addDays(selectedDate, 7));
    };

    const handleDragEnd = (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo,
    ) => {
        const swipeThreshold = 50; // minimum distance for swipe
        const swipeVelocity = 500; // minimum velocity for swipe

        if (
            Math.abs(info.offset.x) > swipeThreshold ||
            Math.abs(info.velocity.x) > swipeVelocity
        ) {
            if (info.offset.x > 0) {
                // Swipe right - go to previous week
                setSwipeDirection('right');
                setTimeout(() => {
                    handlePrevWeek();
                    setSwipeDirection(null);
                }, 150);
            } else {
                // Swipe left - go to next week
                setSwipeDirection('left');
                setTimeout(() => {
                    handleNextWeek();
                    setSwipeDirection(null);
                }, 150);
            }
        }
    };

    const getDayLabel = (date: Date) => {
        return format(date, 'EEE', { locale: fr }).charAt(0).toUpperCase();
    };

    const getTaskCount = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return taskCounts[dateKey] || 0;
    };

    return (
        <div className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevWeek}
                    className="h-9 w-9"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                        {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                    </h2>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && onDateSelect(date)}
                                locale={fr}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextWeek}
                    className="h-9 w-9"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Week Days with Swipe Support */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={{
                    x:
                        swipeDirection === 'left'
                            ? -20
                            : swipeDirection === 'right'
                              ? 20
                              : 0,
                    opacity: swipeDirection ? 0.7 : 1,
                }}
                transition={{ duration: 0.15 }}
                className="grid cursor-grab touch-pan-y grid-cols-7 gap-2 active:cursor-grabbing"
            >
                {weekDays.map((day, index) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const taskCount = getTaskCount(day);

                    return (
                        <motion.button
                            key={day.toISOString()}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                'relative flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200',
                                'hover:bg-muted/50 active:scale-95',
                                isSelected &&
                                    'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:from-primary/90 hover:to-primary/70',
                                !isSelected &&
                                    isCurrentDay &&
                                    'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 ring-2 ring-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:text-blue-400 dark:ring-blue-800',
                            )}
                        >
                            {/* Medal for current day */}
                            {isCurrentDay && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        delay: 0.3,
                                    }}
                                    className="absolute -top-2 -right-2"
                                >
                                    <Award
                                        className={cn(
                                            'h-5 w-5',
                                            isSelected
                                                ? 'fill-yellow-300 text-yellow-400'
                                                : 'fill-yellow-500 text-yellow-600',
                                        )}
                                    />
                                </motion.div>
                            )}

                            {/* Day Label */}
                            <span
                                className={cn(
                                    'text-xs font-medium uppercase',
                                    isSelected
                                        ? 'text-primary-foreground/90'
                                        : isCurrentDay
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-muted-foreground',
                                )}
                            >
                                {getDayLabel(day)}
                            </span>

                            {/* Day Number */}
                            <span
                                className={cn(
                                    'text-xl font-bold',
                                    isSelected && 'text-primary-foreground',
                                    !isSelected &&
                                        isCurrentDay &&
                                        'text-blue-700 dark:text-blue-300',
                                )}
                            >
                                {format(day, 'd')}
                            </span>

                            {/* Task Count Badge */}
                            {taskCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    className={cn(
                                        'flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold',
                                        isSelected
                                            ? 'bg-white/20 text-primary-foreground backdrop-blur-sm'
                                            : isCurrentDay
                                              ? 'bg-blue-600 text-white dark:bg-blue-500'
                                              : 'bg-primary/10 text-primary',
                                    )}
                                >
                                    {taskCount}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
