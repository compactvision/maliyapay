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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRoutines } from '@/hooks/useRoutines';
import { useRoutineTasks } from '@/hooks/useRoutineTasks';
import { AppLayout } from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit2,
    Loader2,
    Plus,
    Power,
    Settings,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const DAYS = [
    { value: 1, label: 'Lundi', short: 'Lu' },
    { value: 2, label: 'Mardi', short: 'Ma' },
    { value: 3, label: 'Mercredi', short: 'Me' },
    { value: 4, label: 'Jeudi', short: 'Je' },
    { value: 5, label: 'Vendredi', short: 'Ve' },
    { value: 6, label: 'Samedi', short: 'Sa' },
    { value: 7, label: 'Dimanche', short: 'Di' },
];

const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
];

const PRIORITIES = [
    { value: 'low', label: 'Basse', color: 'bg-green-100 text-green-800' },
    {
        value: 'medium',
        label: 'Moyenne',
        color: 'bg-yellow-100 text-yellow-800',
    },
    { value: 'high', label: 'Haute', color: 'bg-red-100 text-red-800' },
];

const routineFormSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    color: z.string().optional(),
});

const taskFormSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    description: z.string().optional(),
    dayOfWeek: z.number().min(1).max(7),
    timeStart: z.string().optional(),
    timeEnd: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
});

type RoutineFormValues = z.infer<typeof routineFormSchema>;
type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function RoutinePage() {
    const {
        routines,
        activeRoutines,
        inactiveRoutines,
        isLoading,
        createRoutine,
        updateRoutine,
        toggleActive,
        deleteRoutine,
    } = useRoutines();

    const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
        null,
    );
    const [formOpen, setFormOpen] = useState(false);
    const [taskFormOpen, setTaskFormOpen] = useState(false);
    const [editRoutineId, setEditRoutineId] = useState<string | null>(null);
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        tasks,
        isLoading: tasksLoading,
        createTask,
        updateTask,
        deleteTask: deleteRoutineTask,
        getTasksByDay,
    } = useRoutineTasks(selectedRoutineId);

    const routineForm = useForm<RoutineFormValues>({
        resolver: zodResolver(routineFormSchema),
        defaultValues: {
            name: '',
            color: COLORS[0],
        },
    });

    const taskForm = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: '',
            description: '',
            dayOfWeek: 1,
            timeStart: '',
            timeEnd: '',
            priority: 'medium',
        },
    });

    const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);

    const resetRoutineForm = () => {
        routineForm.reset();
        setEditRoutineId(null);
    };

    const resetTaskForm = () => {
        taskForm.reset();
        setEditTaskId(null);
    };

    const openRoutineForm = (routine?: any) => {
        if (routine) {
            routineForm.setValue('name', routine.name);
            routineForm.setValue('color', routine.color || COLORS[0]);
            setEditRoutineId(routine.id);
        } else {
            resetRoutineForm();
        }
        setFormOpen(true);
    };

    const openTaskForm = (task?: any, dayOfWeek?: number) => {
        if (task) {
            taskForm.setValue('title', task.title);
            taskForm.setValue('description', task.description || '');
            taskForm.setValue('dayOfWeek', task.dayOfWeek);
            taskForm.setValue('timeStart', task.timeStart || '');
            taskForm.setValue('timeEnd', task.timeEnd || '');
            taskForm.setValue('priority', task.priority);
            setEditTaskId(task.id);
        } else {
            resetTaskForm();
            if (dayOfWeek) {
                taskForm.setValue('dayOfWeek', dayOfWeek);
            }
        }
        setTaskFormOpen(true);
    };

    const closeRoutineForm = () => {
        setFormOpen(false);
        resetRoutineForm();
    };

    const closeTaskForm = () => {
        setTaskFormOpen(false);
        resetTaskForm();
    };

    const handleRoutineSubmit = async (values: RoutineFormValues) => {
        setIsSubmitting(true);
        try {
            if (editRoutineId) {
                await updateRoutine(editRoutineId, values);
            } else {
                await createRoutine(values);
            }
            closeRoutineForm();
        } catch (error) {
            console.error('Error submitting routine:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTaskSubmit = async (values: TaskFormValues) => {
        setIsSubmitting(true);
        try {
            if (editTaskId) {
                await updateTask(editTaskId, values);
            } else {
                await createTask(values);
            }
            closeTaskForm();
        } catch (error) {
            console.error('Error submitting task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await toggleActive(id);
        } catch (error) {
            console.error('Error toggling routine:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteRoutine(deleteId);
            if (selectedRoutineId === deleteId) {
                setSelectedRoutineId(null);
            }
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting routine:', error);
        }
    };

    const handleDeleteTask = async () => {
        if (!deleteTaskId) return;
        try {
            await deleteRoutineTask(deleteTaskId);
            setDeleteTaskId(null);
        } catch (error) {
            console.error('Error deleting task:', error);
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

    // Detail view
    if (selectedRoutineId && selectedRoutine) {
        return (
            <AppLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedRoutineId(null)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                {selectedRoutine.color && (
                                    <div
                                        className="h-8 w-8 rounded-full"
                                        style={{
                                            backgroundColor:
                                                selectedRoutine.color,
                                        }}
                                    />
                                )}
                                <h1 className="text-2xl font-bold">
                                    {selectedRoutine.name}
                                </h1>
                                <Badge
                                    variant={
                                        selectedRoutine.isActive
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {selectedRoutine.isActive
                                        ? 'Active'
                                        : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            onClick={() => openRoutineForm(selectedRoutine)}
                            variant="outline"
                            className="gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Modifier
                        </Button>
                    </div>

                    {/* Tasks by day */}
                    <div className="grid gap-4">
                        {DAYS.map((day) => {
                            const dayTasks = getTasksByDay(day.value);
                            return (
                                <Card key={day.value}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                {day.label}
                                            </CardTitle>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    openTaskForm(
                                                        undefined,
                                                        day.value,
                                                    )
                                                }
                                                className="gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Ajouter
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {dayTasks.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Aucune tâche pour ce jour
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {dayTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="group flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                                                    >
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">
                                                                    {task.title}
                                                                </p>
                                                                <Badge
                                                                    className={
                                                                        PRIORITIES.find(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.value ===
                                                                                task.priority,
                                                                        )?.color
                                                                    }
                                                                >
                                                                    {
                                                                        PRIORITIES.find(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.value ===
                                                                                task.priority,
                                                                        )?.label
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            {task.description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        task.description
                                                                    }
                                                                </p>
                                                            )}
                                                            {task.timeRange && (
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <Clock className="h-3 w-3" />
                                                                    {
                                                                        task.timeRange
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() =>
                                                                    openTaskForm(
                                                                        task,
                                                                    )
                                                                }
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    setDeleteTaskId(
                                                                        task.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Task Form Dialog */}
                <Dialog open={taskFormOpen} onOpenChange={closeTaskForm}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editTaskId
                                    ? 'Modifier la tâche'
                                    : 'Nouvelle tâche'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...taskForm}>
                            <form
                                onSubmit={taskForm.handleSubmit(
                                    handleTaskSubmit,
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={taskForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Réunion d'équipe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={taskForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description (optionnel)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Détails de la tâche..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={taskForm.control}
                                    name="dayOfWeek"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jour</FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        parseInt(value),
                                                    )
                                                }
                                                value={field.value.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                DAYS.find(
                                                                    (d) =>
                                                                        d.value ===
                                                                        field.value,
                                                                )?.label ||
                                                                'Sélectionner un jour'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {DAYS.map((day) => (
                                                        <SelectItem
                                                            key={day.value}
                                                            value={day.value.toString()}
                                                        >
                                                            {day.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={taskForm.control}
                                        name="timeStart"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Heure début
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={taskForm.control}
                                        name="timeEnd"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Heure fin</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={taskForm.control}
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
                                                        <SelectValue
                                                            placeholder={
                                                                PRIORITIES.find(
                                                                    (p) =>
                                                                        p.value ===
                                                                        field.value,
                                                                )?.label ||
                                                                'Sélectionner une priorité'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PRIORITIES.map((p) => (
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
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={closeTaskForm}
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
                                        {editTaskId ? 'Modifier' : 'Créer'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Delete Task Confirmation */}
                <AlertDialog
                    open={!!deleteTaskId}
                    onOpenChange={() => setDeleteTaskId(null)}
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
                                onClick={handleDeleteTask}
                            >
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        );
    }

    // List view
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Routines
                        </h1>
                        <p className="text-muted-foreground">
                            Gérez vos routines hebdomadaires
                        </p>
                    </div>
                    <Button
                        onClick={() => openRoutineForm()}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle routine
                    </Button>
                </div>

                {/* Active Routines */}
                {activeRoutines.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Actives ({activeRoutines.length})
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeRoutines.map((routine) => (
                                <Card
                                    key={routine.id}
                                    className="group relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                                    onClick={() =>
                                        setSelectedRoutineId(routine.id)
                                    }
                                >
                                    {routine.color && (
                                        <div
                                            className="absolute top-0 left-0 h-full w-1"
                                            style={{
                                                backgroundColor: routine.color,
                                            }}
                                        />
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">
                                                {routine.name}
                                            </CardTitle>
                                            <div
                                                className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openRoutineForm(routine)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleToggle(routine.id)
                                                    }
                                                >
                                                    <Power className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(routine.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Cliquez pour configurer</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inactive Routines */}
                {inactiveRoutines.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-muted-foreground">
                            Inactives ({inactiveRoutines.length})
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {inactiveRoutines.map((routine) => (
                                <Card
                                    key={routine.id}
                                    className="group relative opacity-60"
                                >
                                    {routine.color && (
                                        <div
                                            className="absolute top-0 left-0 h-full w-1"
                                            style={{
                                                backgroundColor: routine.color,
                                            }}
                                        />
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">
                                                {routine.name}
                                            </CardTitle>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleToggle(routine.id)
                                                    }
                                                >
                                                    <Power className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(routine.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {routines.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">
                                Aucune routine
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Créez votre première routine pour commencer
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Routine Form Dialog */}
            <Dialog open={formOpen} onOpenChange={closeRoutineForm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editRoutineId
                                ? 'Modifier la routine'
                                : 'Nouvelle routine'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...routineForm}>
                        <form
                            onSubmit={routineForm.handleSubmit(
                                handleRoutineSubmit,
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={routineForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Travail, Sport, Maison"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={routineForm.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Couleur</FormLabel>
                                        <div className="flex gap-2">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={cn(
                                                        'h-10 w-10 rounded-full border-2 transition-all',
                                                        field.value === color
                                                            ? 'scale-110 border-foreground'
                                                            : 'border-transparent hover:scale-105',
                                                    )}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    onClick={() =>
                                                        field.onChange(color)
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={closeRoutineForm}
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
                                    {editRoutineId ? 'Modifier' : 'Créer'}
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
                            Supprimer la routine ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Toutes les tâches
                            associées seront également supprimées.
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
