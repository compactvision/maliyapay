import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFormErrorScroll } from '@/hooks/useFormErrorScroll';
import { AppLayout } from '@/layouts/AppLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

// Interfaces
interface Category {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
}

interface Budget {
    id: string;
    category_id: string;
    amount: number;
    currency: string;
    period: 'daily' | 'weekly' | 'monthly';
    spent_amount: number;
}

const budgetSchema = z.object({
    category_id: z.string().min(1, 'Catégorie requise'),
    amount: z.string().min(1, 'Montant requis'),
    currency: z.string().length(3, 'Devise invalide'),
    period: z.enum(['daily', 'weekly', 'monthly']),
});

export default function Budget() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof budgetSchema>>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            category_id: '',
            amount: '',
            currency: 'CDF',
            period: 'monthly',
        },
    });

    // Auto-scroll to first error
    useFormErrorScroll(form.formState.errors);

    const fetchData = async () => {
        try {
            const [catsRes, budgetsRes] = await Promise.all([
                axios.get('/api/categories'),
                axios.get('/api/budgets'),
            ]);
            setCategories(catsRes.data.data);
            setBudgets(budgetsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!open) {
            setSelectedBudget(null);
            form.reset({
                category_id: '',
                amount: '',
                currency: 'USD',
                period: 'monthly',
            });
        }
    }, [open, form]);

    const onSubmit = async (values: z.infer<typeof budgetSchema>) => {
        setIsSubmitting(true);
        try {
            if (selectedBudget) {
                await axios.put(`/api/budgets/${selectedBudget.id}`, values);
                toast.success('Budget modifié avec succès');
            } else {
                await axios.post('/api/budgets', values);
                toast.success('Budget créé avec succès');
            }
            await fetchData();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to save budget', error);
            toast.error("Erreur lors de l'enregistrement du budget");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/budgets/${deleteId}`);
            toast.success('Budget supprimé avec succès');
            await fetchData();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete budget', error);
            toast.error('Erreur lors de la suppression du budget');
        }
    };

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget);
        form.reset({
            category_id: budget.category_id,
            amount: budget.amount.toString(),
            currency: budget.currency,
            period: budget.period,
        });
        setOpen(true);
    };

    const handleNewBudget = () => {
        setSelectedBudget(null);
        form.reset({
            category_id: '',
            amount: '',
            currency: 'USD',
            period: 'monthly',
        });
        setOpen(true);
    };

    const periodLabels: Record<string, string> = {
        daily: 'Journalier',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuel',
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Budgets
                        </h1>
                        <p className="text-muted-foreground">
                            Gérez vos limites de dépenses par catégorie
                        </p>
                    </div>
                    <Button onClick={handleNewBudget} variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Budget
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {budgets.map((budget) => {
                                const category = categories.find(
                                    (c) => c.id === budget.category_id,
                                );
                                // Use real spent amount from backend
                                const spent = budget.spent_amount || 0;
                                const percentage = Math.min(
                                    (spent / budget.amount) * 100,
                                    100,
                                );

                                return (
                                    <Card
                                        key={budget.id}
                                        className="transition-shadow hover:shadow-md"
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {category?.name ||
                                                    'Catégorie inconnue'}
                                            </CardTitle>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-1 text-2xl font-bold">
                                                {budget.amount}{' '}
                                                {budget.currency}
                                            </div>
                                            <p className="mb-4 text-xs text-muted-foreground">
                                                {periodLabels[budget.period]}
                                            </p>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Dépensé</span>
                                                    <span>
                                                        {spent}{' '}
                                                        {budget.currency}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={percentage}
                                                    className="h-2"
                                                    indicatorColor={
                                                        category?.color
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2 border-t bg-gray-50/50 p-2 dark:bg-gray-800/50">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEdit(budget)
                                                }
                                            >
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                                <span className="sr-only">
                                                    Modifier
                                                </span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteId(budget.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                <span className="sr-only">
                                                    Supprimer
                                                </span>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                        {budgets.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="mb-4 rounded-full bg-muted p-4">
                                        <Wallet className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">
                                        Aucun budget
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Créez votre premier budget pour
                                        commencer
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                {selectedBudget
                                    ? 'Modifier le budget'
                                    : 'Nouveau budget'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-3 sm:space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs sm:text-sm">
                                                Catégorie
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!!selectedBudget}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-base sm:h-10">
                                                        <SelectValue placeholder="Sélectionner" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={cat.id}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Montant
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="h-9 text-base sm:h-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Devise
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 text-base sm:h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="CDF">
                                                            CDF
                                                        </SelectItem>
                                                        <SelectItem value="USD">
                                                            USD
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs sm:text-sm">
                                                Période
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-base sm:h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daily">
                                                        Journalier
                                                    </SelectItem>
                                                    <SelectItem value="weekly">
                                                        Hebdomadaire
                                                    </SelectItem>
                                                    <SelectItem value="monthly">
                                                        Mensuel
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="h-9 w-full text-sm sm:h-10"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                                    )}
                                    Enregistrer
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce budget ?
                                Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteId(null)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
