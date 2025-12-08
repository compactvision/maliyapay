import { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2, PiggyBank, Plus, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';

// --- Helper Function ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- Mock Data ---
const mockPeriods = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
];

const mockExpenseCategories = [
  { id: 'cat_1', name: 'Courses', color: '#ef4444' },
  { id: 'cat_2', name: 'Loisir', color: '#f97316' },
  { id: 'cat_3', name: 'Transport', color: '#eab308' },
  { id: 'cat_4', name: 'Logement', color: '#84cc16' },
];

const mockSpending = {
  cat_1: 350,
  cat_2: 120,
  cat_3: 80,
  cat_4: 850,
};

const initialBudgets = [
  { id: 'b_1', categoryId: 'cat_1', amount: 500, period: 'monthly' },
  { id: 'b_2', categoryId: 'cat_2', amount: 200, period: 'monthly' },
  { id: 'b_3', categoryId: 'cat_3', amount: 100, period: 'monthly' },
  { id: 'b_4', categoryId: 'cat_4', amount: 900, period: 'monthly' },
];

// --- Zod Schema for Form ---
const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'La catégorie est requise'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Montant invalide'),
  period: z.string().min(1, 'La période est requise'),
});

export default function BudgetPage() {
  // --- State Management ---
  const [budgets, setBudgets] = useState(initialBudgets);
  const [formOpen, setFormOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form Handling ---
  const form = useForm({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: '',
      amount: '0',
      period: 'monthly',
    },
  });

  const resetForm = () => {
    form.reset();
    setEditBudget(null);
  };

  const openForm = (budget?: any) => {
    if (budget) {
      form.setValue('categoryId', budget.categoryId);
      form.setValue('amount', budget.amount.toString());
      form.setValue('period', budget.period);
      setEditBudget(budget);
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
    const budgetData = { ...values, amount: parseFloat(values.amount) };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    if (editBudget) {
      console.log('Modification du budget:', { id: editBudget.id, ...budgetData });
      setBudgets(prev => prev.map(b => b.id === editBudget.id ? { ...b, ...budgetData } : b));
    } else {
      console.log('Ajout du budget:', budgetData);
      setBudgets(prev => [...prev, { ...budgetData, id: Date.now().toString() }]);
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    console.log('Suppression du budget avec l\'ID:', deleteId);
    setBudgets(prev => prev.filter(b => b.id !== deleteId));
    setDeleteId(null);
  };

  // --- Derived State (Calculations) ---
  const budgetsWithSpending = budgets.map(budget => {
    const category = mockExpenseCategories.find(c => c.id === budget.categoryId);
    const spending = mockSpending[budget.categoryId as keyof typeof mockSpending] || 0;
    return {
      ...budget,
      categoryName: category?.name || 'Inconnu',
      categoryColor: category?.color || '#888',
      spending,
    };
  });

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground">Définissez vos limites de dépenses par catégorie</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nouveau budget
          </Button>
        </div>

        {/* Budgets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetsWithSpending.map((budget) => {
            const percentage = Math.min((budget.spending / budget.amount) * 100, 100);
            const remaining = budget.amount - budget.spending;
            const isOverBudget = remaining < 0;

            return (
              <Card key={budget.id} className="group relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${budget.categoryColor}20` }}>
                        <PiggyBank className="h-5 w-5" style={{ color: budget.categoryColor }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{budget.categoryName}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{mockPeriods.find(p => p.value === budget.period)?.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(budget)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setDeleteId(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dépensé</span>
                      <span className="font-medium">{formatCurrency(budget.spending)} / {formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full transition-all", getProgressColor(percentage))} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <p className={cn("text-sm font-medium", isOverBudget ? "text-red-600" : "text-muted-foreground")}>
                    {isOverBudget ? `Dépassement de ${formatCurrency(Math.abs(remaining))}` : `Reste ${formatCurrency(remaining)}`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {budgets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-muted p-4">
                <PiggyBank className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Aucun budget</h3>
              <p className="mt-1 text-sm text-muted-foreground">Créez votre premier budget pour suivre vos dépenses</p>
              <Button onClick={() => openForm()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Créer un budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Budget Form Dialog */}
      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBudget ? 'Modifier le budget' : 'Nouveau budget'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger></FormControl>
                  <SelectContent>{mockExpenseCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Montant limite (€)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="period" render={({ field }) => (
                <FormItem><FormLabel>Période</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{mockPeriods.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editBudget ? 'Modifier' : 'Ajouter'}
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
            <AlertDialogTitle>Supprimer le budget ?</AlertDialogTitle>
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