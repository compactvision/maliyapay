import { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckSquare, Circle, Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helper Function ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- Mock Data ---
const mockPriorities = [
  { value: 'low', label: 'Basse', color: 'text-green-600' },
  { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
  { value: 'high', label: 'Haute', color: 'text-red-600' },
];

const initialTodos = [
  { id: '1', title: 'Payer la facture EDF', description: 'Ne pas oublier', priority: 'high', dueDate: new Date(Date.now() + 86400000), completed: false },
  { id: '2', title: 'Appeler le plombier', priority: 'medium', dueDate: new Date(Date.now() + 172800000), completed: false },
  { id: '3', title: 'Faire les courses', priority: 'low', dueDate: new Date(Date.now() + 604800000), completed: false },
  { id: '4', title: 'Finaliser le rapport', priority: 'high', completed: true },
];

// --- Zod Schema for Form ---
const todoFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

export default function TaskPage() {
  // --- State Management ---
  const [todos, setTodos] = useState(initialTodos);
  const [formOpen, setFormOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  // --- Derived State ---
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  // --- Form Handling ---
  const form = useForm({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const resetForm = () => {
    form.reset();
    setEditTodo(null);
  };

  const openForm = (todo?: any) => {
    if (todo) {
      form.setValue('title', todo.title);
      form.setValue('description', todo.description || '');
      form.setValue('priority', todo.priority);
      form.setValue('dueDate', todo.dueDate ? new Date(todo.dueDate) : undefined);
      setEditTodo(todo);
    } else {
      resetForm();
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const todoData = { ...values, completed: false };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    if (editTodo) {
      console.log('Modification de la tâche:', { id: editTodo.id, ...todoData });
      setTodos(prev => prev.map(todo => todo.id === editTodo.id ? { ...todo, ...todoData } : todo));
    } else {
      console.log('Ajout de la tâche:', todoData);
      setTodos(prev => [...prev, { ...todoData, id: Date.now().toString() }]);
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      await handleAddTodo({
        title: quickTitle.trim(),
        priority: 'medium',
      });
      setQuickTitle('');
    }
  };

  const handleAddTodo = async (todoData: any) => {
    console.log('Ajout de la tâche:', todoData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTodos(prev => [...prev, { ...todoData, id: Date.now().toString() }]);
  };

  const handleToggle = async (id: string) => {
    console.log('Basculement de la tâche:', id);
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const handleDelete = () => {
    if (!deleteId) return;
    console.log('Suppression de la tâche:', deleteId);
    setTodos(prev => prev.filter(todo => todo.id !== deleteId));
    setDeleteId(null);
  };

  // --- Helper Functions ---
  const getDueDateClass = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-destructive';
    if (diffDays === 0) return 'text-yellow-600';
    if (diffDays <= 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getDueDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `En retard de ${Math.abs(diffDays)} jour(s)`;
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jour(s)`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
            <p className="text-muted-foreground">Gérez vos rappels et échéances financières</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>

        {/* Quick Add */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <Input
                name="quickTitle"
                placeholder="Ajouter une tâche rapide..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Todos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">À faire ({activeTodos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTodos.length > 0 ? (
              <div className="space-y-2">
                {activeTodos.map((todo) => (
                  <div key={todo.id} className="group flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-sm">
                    <button onClick={() => handleToggle(todo.id)} className="mt-0.5 text-muted-foreground transition-colors hover:text-primary">
                      <Circle className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{todo.title}</p>
                        <span className={cn("text-xs font-medium", mockPriorities.find(p => p.value === todo.priority)?.color)}>
                          {mockPriorities.find(p => p.value === todo.priority)?.label}
                        </span>
                      </div>
                      {todo.description && <p className="mt-0.5 text-sm text-muted-foreground">{todo.description}</p>}
                      {todo.dueDate && (
                        <p className={cn("mt-1 text-xs", getDueDateClass(todo.dueDate))}>
                          <CalendarIcon className="mr-1 inline h-3 w-3" />
                          {getDueDateLabel(todo.dueDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(todo)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(todo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Aucune tâche en cours</div>
            )}
          </CardContent>
        </Card>

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Terminées ({completedTodos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="group flex items-start gap-3 rounded-lg border p-3 opacity-60">
                    <button onClick={() => handleToggle(todo.id)} className="text-success mt-0.5">
                      <CheckSquare className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium line-through">{todo.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(todo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {todos.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-muted p-4">
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Aucune tâche</h3>
              <p className="mt-1 text-sm text-muted-foreground">Ajoutez votre première tâche pour commencer</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Todo Form Dialog */}
      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTodo ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Ex: Payer la facture" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description (optionnel)</FormLabel><FormControl><Textarea placeholder="Notes additionnelles..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Échéance (optionnel)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {mockPriorities.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editTodo ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la tâche ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}