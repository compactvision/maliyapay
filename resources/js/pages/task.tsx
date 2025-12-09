import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useRoutineTasksForDay } from '@/hooks/useRoutines';
import { useTasks } from '@/hooks/useTasks';
import { AppLayout } from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format, isBefore, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    CalendarIcon,
    CheckCircle2,
    CheckSquare,
    Circle,
    Clock,
    Edit2,
    Filter,
    Loader2,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// --- Constants ---
const mockPriorities = [
    {
        value: 'low',
        label: 'Basse',
        color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    },
    {
        value: 'medium',
        label: 'Moyenne',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    },
    {
        value: 'high',
        label: 'Haute',
        color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    },
];

// --- Zod Schema for Form ---
const todoFormSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    priority: z.enum(['low', 'medium', 'high']),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

export default function TaskPage() {
    // --- Hooks ---
    const {
        activeTasks,
        completedTasks,
        isLoading,
        createTask,
        updateTask,
        toggleCompletion,
        deleteTask,
    } = useTasks();

    // Get today's day of week (1 = Monday, 7 = Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

    const { tasks: routineTasks, isLoading: routineTasksLoading } =
        useRoutineTasksForDay(dayOfWeek);

    // --- State Management ---
    const [formOpen, setFormOpen] = useState(false);
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quickTitle, setQuickTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('all');

    // --- Form Handling ---
    const form = useForm<TodoFormValues>({
        resolver: zodResolver(todoFormSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
        },
    });

    const resetForm = () => {
        form.reset();
        setEditTaskId(null);
    };

    const openForm = (task?: any) => {
        if (task) {
            form.setValue('title', task.title);
            form.setValue('description', task.description || '');
            form.setValue('priority', task.priority);
            form.setValue(
                'dueDate',
                task.dueDate ? new Date(task.dueDate) : undefined,
            );
            setEditTaskId(task.id);
        } else {
            resetForm();
        }
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        resetForm();
    };

    const handleSubmit = async (values: TodoFormValues) => {
        setIsSubmitting(true);
        try {
            const taskData = {
                title: values.title,
                description: values.description || undefined,
                priority: values.priority,
                dueDate: values.dueDate
                    ? format(values.dueDate, 'yyyy-MM-dd')
                    : undefined,
            };

            if (editTaskId) {
                await updateTask(editTaskId, taskData);
            } else {
                await createTask(taskData);
            }

            closeForm();
        } catch (error) {
            console.error('Error submitting task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quickTitle.trim()) {
            try {
                await createTask({
                    title: quickTitle.trim(),
                    priority: 'medium',
                });
                setQuickTitle('');
            } catch (error) {
                console.error('Error creating quick task:', error);
            }
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await toggleCompletion(id);
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteTask(deleteId);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleRoutineTaskCheck = async (routineTask: any) => {
        try {
            // Create a real task from the routine task
            await createTask({
                title: routineTask.title,
                description: routineTask.description || undefined,
                priority: routineTask.priority,
                dueDate: format(today, 'yyyy-MM-dd'),
            });
            // Note: The toast success message is already shown by createTask in useTasks hook
        } catch (error) {
            console.error('Error creating task from routine:', error);
        }
    };

    // --- Helper Functions ---
    const getDueDateClass = (dateString: string | null) => {
        if (!dateString) return 'text-muted-foreground';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (isBefore(dueDate, today)) return 'text-red-600 dark:text-red-400';
        if (isToday(dueDate)) return 'text-yellow-600 dark:text-yellow-400';
        if (isTomorrow(dueDate)) return 'text-orange-600 dark:text-orange-400';
        if (isBefore(dueDate, addDays(today, 7)))
            return 'text-blue-600 dark:text-blue-400';
        return 'text-muted-foreground';
    };

    const getDueDateLabel = (dateString: string | null) => {
        if (!dateString) return '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (isBefore(dueDate, today)) {
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `En retard de ${diffDays} jour(s)`;
        }
        if (isToday(dueDate)) return "Aujourd'hui";
        if (isTomorrow(dueDate)) return 'Demain';
        return format(dueDate, 'd MMMM', { locale: fr });
    };

    // Filter tasks based on search term and filters
    const filteredActiveTasks = useMemo(() => {
        return activeTasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description &&
                    task.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            const matchesPriority =
                filterPriority === 'all' || task.priority === filterPriority;

            let matchesDate = true;
            if (filterDate !== 'all' && task.dueDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                if (filterDate === 'today') matchesDate = isToday(dueDate);
                else if (filterDate === 'week')
                    matchesDate = isBefore(dueDate, addDays(today, 7));
                else if (filterDate === 'overdue')
                    matchesDate = isBefore(dueDate, today);
            }

            return matchesSearch && matchesPriority && matchesDate;
        });
    }, [activeTasks, searchTerm, filterPriority, filterDate]);

    const filteredCompletedTasks = useMemo(() => {
        return completedTasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description &&
                    task.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            const matchesPriority =
                filterPriority === 'all' || task.priority === filterPriority;

            return matchesSearch && matchesPriority;
        });
    }, [completedTasks, searchTerm, filterPriority]);

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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Tâches
                        </h1>
                        <p className="text-muted-foreground">
                            Gérez vos rappels et échéances financières
                        </p>
                    </div>
                    <Button
                        onClick={() => openForm()}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle tâche
                    </Button>
                </div>

                {/* Quick Add */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleQuickAdd} className="flex gap-2">
                            <Input
                                name="quickTitle"
                                placeholder="Ajouter une tâche rapide..."
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" className="shrink-0">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une tâche..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={filterPriority}
                                    onValueChange={setFilterPriority}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Priorité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Toutes priorités
                                        </SelectItem>
                                        {mockPriorities.map((p) => (
                                            <SelectItem
                                                key={p.value}
                                                value={p.value}
                                            >
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filterDate}
                                    onValueChange={setFilterDate}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Toutes dates
                                        </SelectItem>
                                        <SelectItem value="today">
                                            Aujourd'hui
                                        </SelectItem>
                                        <SelectItem value="week">
                                            Cette semaine
                                        </SelectItem>
                                        <SelectItem value="overdue">
                                            En retard
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {(searchTerm ||
                                    filterPriority !== 'all' ||
                                    filterDate !== 'all') && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterPriority('all');
                                            setFilterDate('all');
                                        }}
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Routine Tasks for Today */}
                {routineTasks.length > 0 && (
                    <Card className="overflow-hidden border-0 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Tâches de routine ({routineTasks.length})
                                </CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {format(today, 'EEEE', { locale: fr })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {routineTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 transition-all hover:shadow-sm dark:border-blue-900 dark:bg-blue-950/20"
                                    >
                                        <button
                                            onClick={() =>
                                                handleRoutineTaskCheck(task)
                                            }
                                            className="mt-0.5 text-blue-500 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
                                            title="Créer une tâche à partir de cette routine"
                                        >
                                            <Circle className="h-5 w-5" />
                                        </button>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {task.title}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'gap-1 border-0 font-medium',
                                                        task.priority ===
                                                            'high' &&
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                                        task.priority ===
                                                            'medium' &&
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                                        task.priority ===
                                                            'low' &&
                                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
                                                    {task.priority === 'high' &&
                                                        'Haute'}
                                                    {task.priority ===
                                                        'medium' && 'Moyenne'}
                                                    {task.priority === 'low' &&
                                                        'Basse'}
                                                </Badge>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                {task.timeRange && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {task.timeRange}
                                                    </div>
                                                )}
                                                {task.dayLabel && (
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {task.dayLabel}
                                                    </div>
                                                )}
                                                <span className="text-xs text-blue-600 italic dark:text-blue-400">
                                                    📅 Routine
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                💡 Ces tâches proviennent de vos routines. Elles
                                se régénèrent automatiquement chaque jour.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Tasks Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all" className="relative">
                            Toutes
                            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                {activeTasks.length + completedTasks.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="active" className="relative">
                            À faire
                            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                {filteredActiveTasks.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="relative">
                            Terminées
                            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                {filteredCompletedTasks.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        {/* Active Todos */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    À faire ({filteredActiveTasks.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredActiveTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredActiveTasks.map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="group flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-sm"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleToggle(todo.id)
                                                    }
                                                    className="mt-0.5 text-muted-foreground transition-colors hover:text-primary"
                                                >
                                                    <Circle className="h-5 w-5" />
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {todo.title}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'gap-1 border-0 font-medium',
                                                                mockPriorities.find(
                                                                    (p) =>
                                                                        p.value ===
                                                                        todo.priority,
                                                                )?.color,
                                                            )}
                                                        >
                                                            {todo.priority ===
                                                                'high' && (
                                                                <AlertCircle className="h-3 w-3" />
                                                            )}
                                                            {todo.priority ===
                                                                'medium' && (
                                                                <Clock className="h-3 w-3" />
                                                            )}
                                                            {todo.priority ===
                                                                'low' && (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            )}
                                                            {
                                                                mockPriorities.find(
                                                                    (p) =>
                                                                        p.value ===
                                                                        todo.priority,
                                                                )?.label
                                                            }
                                                        </Badge>
                                                    </div>
                                                    {todo.description && (
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                    {todo.dueDate && (
                                                        <p
                                                            className={cn(
                                                                'mt-1 flex items-center gap-1 text-xs',
                                                                getDueDateClass(
                                                                    todo.dueDate,
                                                                ),
                                                            )}
                                                        >
                                                            <CalendarIcon className="h-3 w-3" />
                                                            {getDueDateLabel(
                                                                todo.dueDate,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openForm(todo)
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            setDeleteId(todo.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        {searchTerm ||
                                        filterPriority !== 'all' ||
                                        filterDate !== 'all'
                                            ? 'Aucune tâche ne correspond à vos filtres'
                                            : 'Aucune tâche en cours'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Completed Todos */}
                        {filteredCompletedTasks.length > 0 && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg text-muted-foreground">
                                        Terminées (
                                        {filteredCompletedTasks.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {filteredCompletedTasks.map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="group flex items-start gap-3 rounded-lg border p-3 opacity-60"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleToggle(todo.id)
                                                    }
                                                    className="text-success mt-0.5"
                                                >
                                                    <CheckSquare className="h-5 w-5" />
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium line-through">
                                                        {todo.title}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(todo.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    À faire ({filteredActiveTasks.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredActiveTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredActiveTasks.map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="group flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-sm"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleToggle(todo.id)
                                                    }
                                                    className="mt-0.5 text-muted-foreground transition-colors hover:text-primary"
                                                >
                                                    <Circle className="h-5 w-5" />
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {todo.title}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'gap-1 border-0 font-medium',
                                                                mockPriorities.find(
                                                                    (p) =>
                                                                        p.value ===
                                                                        todo.priority,
                                                                )?.color,
                                                            )}
                                                        >
                                                            {todo.priority ===
                                                                'high' && (
                                                                <AlertCircle className="h-3 w-3" />
                                                            )}
                                                            {todo.priority ===
                                                                'medium' && (
                                                                <Clock className="h-3 w-3" />
                                                            )}
                                                            {todo.priority ===
                                                                'low' && (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            )}
                                                            {
                                                                mockPriorities.find(
                                                                    (p) =>
                                                                        p.value ===
                                                                        todo.priority,
                                                                )?.label
                                                            }
                                                        </Badge>
                                                    </div>
                                                    {todo.description && (
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                    {todo.dueDate && (
                                                        <p
                                                            className={cn(
                                                                'mt-1 flex items-center gap-1 text-xs',
                                                                getDueDateClass(
                                                                    todo.dueDate,
                                                                ),
                                                            )}
                                                        >
                                                            <CalendarIcon className="h-3 w-3" />
                                                            {getDueDateLabel(
                                                                todo.dueDate,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openForm(todo)
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            setDeleteId(todo.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        {searchTerm ||
                                        filterPriority !== 'all' ||
                                        filterDate !== 'all'
                                            ? 'Aucune tâche ne correspond à vos filtres'
                                            : 'Aucune tâche en cours'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg text-muted-foreground">
                                    Terminées ({filteredCompletedTasks.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredCompletedTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredCompletedTasks.map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="group flex items-start gap-3 rounded-lg border p-3 opacity-60"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleToggle(todo.id)
                                                    }
                                                    className="text-success mt-0.5"
                                                >
                                                    <CheckSquare className="h-5 w-5" />
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium line-through">
                                                        {todo.title}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(todo.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        {searchTerm || filterPriority !== 'all'
                                            ? 'Aucune tâche ne correspond à vos filtres'
                                            : 'Aucune tâche terminée'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {activeTasks.length === 0 && completedTasks.length === 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <CheckSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">
                                Aucune tâche
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Ajoutez votre première tâche pour commencer
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Todo Form Dialog */}
            <Dialog open={formOpen} onOpenChange={closeForm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editTaskId
                                ? 'Modifier la tâche'
                                : 'Nouvelle tâche'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Payer la facture"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description (optionnel)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Notes additionnelles..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Échéance (optionnel)
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !field.value &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    'PPP',
                                                                    {
                                                                        locale: fr,
                                                                    },
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Choisir une
                                                                    date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priorité</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {mockPriorities.map((p) => (
                                                        <SelectItem
                                                            key={p.value}
                                                            value={p.value}
                                                        >
                                                            {p.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={closeForm}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editTaskId ? 'Modifier' : 'Ajouter'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la tâche ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
