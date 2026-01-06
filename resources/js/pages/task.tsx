import { WeekCalendar } from '@/components/task/WeekCalendar';
import { XPSuccessAnimation } from '@/components/task/XPSuccessAnimation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAllRoutineTasks } from '@/hooks/useRoutines';
import { useTasks } from '@/hooks/useTasks';
import { AppLayout } from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import {
    addDays,
    endOfDay,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameDay,
    parseISO,
    startOfDay,
    startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Ban,
    CalendarX,
    CheckCircle2,
    Circle,
    Clock,
    Loader2,
    Repeat,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Task status types
type TaskStatus = 'completed' | 'pending' | 'upcoming' | 'missed';

interface EnrichedTask {
    id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    completed: boolean;
    xp: number;
    status: TaskStatus;
    isRoutine: boolean;
    routineTaskId?: string;
}

export default function TaskPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showXPAnimation, setShowXPAnimation] = useState(false);
    const [earnedXP, setEarnedXP] = useState(0);

    const {
        tasks,
        isLoading: tasksLoading,
        toggleCompletion,
        createTask,
    } = useTasks();
    const { routineTasks, isLoading: routinesLoading } = useAllRoutineTasks();

    const isLoading = tasksLoading || routinesLoading;

    // Generate all routine task instances for the visible week
    const enrichedTasks = useMemo(() => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const allTasks: EnrichedTask[] = [];

        // Add regular tasks (only those with due dates)
        tasks.forEach((task) => {
            if (task.dueDate) {
                const taskDate = parseISO(task.dueDate);
                const status = getTaskStatus(task, taskDate);
                allTasks.push({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    dueDate: task.dueDate, // Guaranteed to be string here
                    completed: task.completed,
                    xp: task.xp,
                    status,
                    isRoutine: !!task.routineTaskId,
                    routineTaskId: task.routineTaskId,
                });
            }
        });

        // Generate routine task instances for each day they're scheduled
        (routineTasks || []).forEach((routineTask: RoutineTask) => {
            const dayOfWeek = routineTask.dayOfWeek; // 1-7 (Mon-Sun)

            // Find all dates in the visible range that match this day of week
            let currentDate = new Date(weekStart);
            while (currentDate <= weekEnd) {
                const currentDayOfWeek =
                    currentDate.getDay() === 0 ? 7 : currentDate.getDay();

                if (currentDayOfWeek === dayOfWeek) {
                    const dateStr = format(currentDate, 'yyyy-MM-dd');

                    // Check if there's an actual task created for this date
                    const existingTask = tasks.find(
                        (t) =>
                            t.dueDate === dateStr &&
                            t.routineTaskId === routineTask.id,
                    );

                    if (!existingTask) {
                        // Create a virtual task instance only if no real task exists
                        const status = getVirtualTaskStatus(currentDate);
                        allTasks.push({
                            id: `routine-${routineTask.id}-${dateStr}`,
                            title: routineTask.title,
                            description: routineTask.description,
                            priority: routineTask.priority,
                            dueDate: dateStr,
                            completed: false,
                            xp: routineTask.xp || 10,
                            status,
                            isRoutine: true,
                            routineTaskId: routineTask.id,
                        });
                    }
                }

                currentDate = addDays(currentDate, 1);
            }
        });

        return allTasks;
    }, [tasks, routineTasks, selectedDate]);

    // Filter tasks for selected date
    const tasksForSelectedDate = useMemo(() => {
        return enrichedTasks.filter((task) => {
            const taskDate = parseISO(task.dueDate);
            return isSameDay(taskDate, selectedDate);
        });
    }, [enrichedTasks, selectedDate]);

    // Calculate task counts per day for calendar badges
    const taskCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        enrichedTasks.forEach((task) => {
            const dateKey = task.dueDate;
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
        return counts;
    }, [enrichedTasks]);

    // Helper functions
    function getTaskStatus(task: any, taskDate: Date): TaskStatus {
        const now = new Date();

        if (task.completed) return 'completed';
        if (isBefore(endOfDay(taskDate), now)) return 'missed';
        if (isSameDay(taskDate, now)) return 'pending';
        return 'upcoming';
    }

    function getVirtualTaskStatus(taskDate: Date): TaskStatus {
        const now = new Date();

        if (isBefore(endOfDay(taskDate), now)) return 'missed';
        if (isSameDay(taskDate, now)) return 'pending';
        return 'upcoming';
    }

    const canCompleteTask = (
        task: EnrichedTask,
    ): { allowed: boolean; reason?: string } => {
        const now = new Date();
        const taskDate = parseISO(task.dueDate);

        // Check if task is in the past
        if (isBefore(endOfDay(taskDate), now)) {
            return { allowed: false, reason: 'Tâche manquée' };
        }

        // Check if task is in the future
        if (isAfter(startOfDay(taskDate), now)) {
            return {
                allowed: false,
                reason: `Prévu pour ${format(taskDate, 'EEEE d MMMM', { locale: fr })}`,
            };
        }

        return { allowed: true };
    };

    const handleTaskToggle = async (task: EnrichedTask) => {
        const validation = canCompleteTask(task);

        if (!validation.allowed) {
            return;
        }

        // For virtual routine tasks, create them first then complete
        if (task.isRoutine && task.id.startsWith('routine-')) {
            try {
                const newTask = await createTask({
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority,
                    dueDate: task.dueDate,
                    routineTaskId: task.routineTaskId,
                });

                // Immediately toggle it to completed
                const completedTask = await toggleCompletion(newTask.id);

                // Show XP animation
                const xp = task.xp || 10;
                setEarnedXP(xp);
                setShowXPAnimation(true);
            } catch (error) {
                console.error(
                    'Error creating and completing routine task:',
                    error,
                );
            }
            return;
        }

        try {
            const wasCompleted = task.completed;
            const updatedTask = await toggleCompletion(task.id);

            if (!wasCompleted && updatedTask.completed) {
                const xp = updatedTask.xp || 10;
                setEarnedXP(xp);
                setShowXPAnimation(true);
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="gap-1 border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Effectué
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="gap-1 border-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-3 w-3" />
                        En attente
                    </Badge>
                );
            case 'upcoming':
                return (
                    <Badge className="gap-1 border-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Sparkles className="h-3 w-3" />À venir
                    </Badge>
                );
            case 'missed':
                return (
                    <Badge className="gap-1 border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <CalendarX className="h-3 w-3" />
                        Manqué
                    </Badge>
                );
        }
    };

    const getTaskIcon = (task: EnrichedTask) => {
        if (task.completed) {
            return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        }

        const validation = canCompleteTask(task);
        if (!validation.allowed) {
            return <Ban className="h-5 w-5 text-red-500" />;
        }

        return <Circle className="h-5 w-5" />;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Mes Tâches
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {format(selectedDate, 'EEEE d MMMM yyyy', {
                                locale: fr,
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                            {
                                tasksForSelectedDate.filter((t) => !t.completed)
                                    .length
                            }{' '}
                            tâches
                        </span>
                    </div>
                </div>

                {/* Week Calendar */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <WeekCalendar
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            taskCounts={taskCounts}
                        />
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {tasksForSelectedDate.length > 0 ? (
                            tasksForSelectedDate.map((task, index) => {
                                const validation = canCompleteTask(task);
                                const isDisabled = !validation.allowed;

                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <Card
                                            className={cn(
                                                'overflow-hidden border-0 shadow-sm transition-all duration-200',
                                                task.completed && 'opacity-60',
                                                !isDisabled &&
                                                    !task.completed &&
                                                    'hover:shadow-md active:scale-[0.99]',
                                            )}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={() =>
                                                            handleTaskToggle(
                                                                task,
                                                            )
                                                        }
                                                        disabled={
                                                            isDisabled &&
                                                            !task.completed
                                                        }
                                                        className={cn(
                                                            'mt-0.5 shrink-0 transition-all',
                                                            task.completed &&
                                                                'text-green-600',
                                                            !task.completed &&
                                                                !isDisabled &&
                                                                'text-muted-foreground hover:scale-110 hover:text-primary',
                                                            isDisabled &&
                                                                !task.completed &&
                                                                'cursor-not-allowed opacity-50',
                                                        )}
                                                    >
                                                        {getTaskIcon(task)}
                                                    </button>

                                                    {/* Task Content */}
                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3
                                                                    className={cn(
                                                                        'leading-tight font-semibold',
                                                                        task.completed &&
                                                                            'line-through',
                                                                    )}
                                                                >
                                                                    {task.title}
                                                                </h3>
                                                                {task.isRoutine && (
                                                                    <Repeat className="h-4 w-4 text-blue-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex shrink-0 gap-2">
                                                                {getStatusBadge(
                                                                    task.status,
                                                                )}
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'gap-1 border-0 text-xs font-medium',
                                                                        getPriorityColor(
                                                                            task.priority,
                                                                        ),
                                                                    )}
                                                                >
                                                                    {task.priority ===
                                                                        'high' && (
                                                                        <AlertCircle className="h-3 w-3" />
                                                                    )}
                                                                    {task.priority ===
                                                                        'medium' && (
                                                                        <Clock className="h-3 w-3" />
                                                                    )}
                                                                    {task.priority ===
                                                                        'low' && (
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                    )}
                                                                    {task.priority ===
                                                                        'high' &&
                                                                        'Haute'}
                                                                    {task.priority ===
                                                                        'medium' &&
                                                                        'Moyenne'}
                                                                    {task.priority ===
                                                                        'low' &&
                                                                        'Basse'}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    task.description
                                                                }
                                                            </p>
                                                        )}

                                                        {/* Validation Message */}
                                                        {!validation.allowed && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: -5,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20"
                                                            >
                                                                <CalendarX className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                                                    {
                                                                        validation.reason
                                                                    }
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 text-center"
                            >
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    Aucune tâche
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pas de tâches prévues pour cette journée
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* XP Success Animation */}
            <XPSuccessAnimation
                isOpen={showXPAnimation}
                xpGained={earnedXP}
                onClose={() => setShowXPAnimation(false)}
            />
        </AppLayout>
    );
}
