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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2, Plus, Tags, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

// --- Types ---
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

// --- Mock Data ---
const mockColors = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const initialExpenseCategories: Category[] = [
  { id: 'exp_1', name: 'Alimentation', type: 'expense', color: '#ef4444' },
  { id: 'exp_2', name: 'Transport', type: 'expense', color: '#f97316' },
  { id: 'exp_3', name: 'Logement', type: 'expense', color: '#eab308' },
];

const initialIncomeCategories: Category[] = [
  { id: 'inc_1', name: 'Salaire', type: 'income', color: '#22c55e' },
  { id: 'inc_2', name: 'Freelance', type: 'income', color: '#14b8a6' },
  { id: 'inc_3', name: 'Investissements', type: 'income', color: '#3b82f6' },
];

// --- Zod Schema for Form ---
const categoryFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['income', 'expense'], { required_error: 'Le type est requis' }),
  color: z.string().min(1, 'La couleur est requise'),
});

export default function CategoryPage() {
  // --- State Management ---
  const [expenseCategories, setExpenseCategories] = useState(initialExpenseCategories);
  const [incomeCategories, setIncomeCategories] = useState(initialIncomeCategories);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form Handling ---
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: mockColors[0],
    },
  });

  const resetForm = () => {
    form.reset();
    setEditCategory(null);
  };

  const openForm = (category?: Category) => {
    if (category) {
      form.setValue('name', category.name);
      form.setValue('type', category.type);
      form.setValue('color', category.color);
      setEditCategory(category);
    } else {
      resetForm();
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    setIsSubmitting(true);
    const categoryData = { ...values, id: Date.now().toString() };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    if (editCategory) {
      console.log('Modification de la catégorie:', { id: editCategory.id, ...categoryData });
      if (editCategory.type === 'expense') {
        setExpenseCategories(prev => prev.map(cat => cat.id === editCategory.id ? { ...cat, ...categoryData } : cat));
      } else {
        setIncomeCategories(prev => prev.map(cat => cat.id === editCategory.id ? { ...cat, ...categoryData } : cat));
      }
    } else {
      console.log('Ajout de la catégorie:', categoryData);
      if (categoryData.type === 'expense') {
        setExpenseCategories(prev => [...prev, categoryData]);
      } else {
        setIncomeCategories(prev => [...prev, categoryData]);
      }
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    console.log('Suppression de la catégorie avec l\'ID:', deleteId);
    setExpenseCategories(prev => prev.filter(cat => cat.id !== deleteId));
    setIncomeCategories(prev => prev.filter(cat => cat.id !== deleteId));
    setDeleteId(null);
  };
  
  // --- Derived State ---
  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  // --- Sub-component ---
  const CategoryGrid = ({ items }: { items: Category[] }) => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((category) => (
        <div key={category.id} className="group flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-sm dark:bg-white/10 dark:border-white/20 dark:backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${category.color}20` }}>
            <Tags className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{category.name}</p>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(category)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => setDeleteId(category.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
            <p className="text-muted-foreground">Organisez vos transactions par catégorie</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </div>

        {/* Categories Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'income' | 'expense')}>
            <CardHeader className="pb-0">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="expense" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Dépenses ({expenseCategories.length})
                </TabsTrigger>
                <TabsTrigger value="income" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenus ({incomeCategories.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="expense" className="mt-0">
                {currentCategories.length > 0 ? <CategoryGrid items={currentCategories} /> : <div className="py-8 text-center text-muted-foreground">Aucune catégorie de dépenses</div>}
              </TabsContent>
              <TabsContent value="income" className="mt-0">
                {currentCategories.length > 0 ? <CategoryGrid items={currentCategories} /> : <div className="py-8 text-center text-muted-foreground">Aucune catégorie de revenus</div>}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Ex: Alimentation" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Tabs value={field.value} onValueChange={field.onChange}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense">Dépense</TabsTrigger>
                      <TabsTrigger value="income">Revenu</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem><FormLabel>Couleur</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {mockColors.map(color => (
                        <button key={color} type="button" className={`h-8 w-8 rounded-full transition-transform ${field.value === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`} style={{ backgroundColor: color }} onClick={() => field.onChange(color)} />
                      ))}
                    </div>
                  </FormControl><FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editCategory ? 'Modifier' : 'Ajouter'}
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
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. Vous ne pouvez pas supprimer une catégorie qui contient des transactions.</AlertDialogDescription>
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