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
import { AppLayout } from '@/layouts/AppLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
    spent_amount?: number; // Placeholder for future backend update
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

    const onSubmit = async (values: z.infer<typeof budgetSchema>) => {
        setIsSubmitting(true);
        try {
            await axios.post('/api/budgets', values);
            await fetchData();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to save budget', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/budgets/${deleteId}`);
            await fetchData();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete budget', error);
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
                    <Button
                        onClick={() => {
                            setSelectedBudget(null);
                            form.reset();
                            setOpen(true);
                        }}
                        variant="primary"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Budget
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => {
                            const category = categories.find(
                                (c) => c.id === budget.category_id,
                            );
                            // Placeholder logic for expenses
                            const spent = 0;
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
                                            {budget.amount} {budget.currency}
                                        </div>
                                        <p className="mb-4 text-xs text-muted-foreground">
                                            {periodLabels[budget.period]}
                                        </p>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Dépensé</span>
                                                <span>
                                                    {spent} {budget.currency}
                                                </span>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                className="h-2"
                                                indicatorColor={category?.color}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 border-t bg-gray-50/50 p-2 dark:bg-gray-800/50">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(budget)}
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
                        {budgets.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Wallet className="h-12 w-12 opacity-20" />
                                <p className="mt-4">Aucun budget défini</p>
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedBudget
                                    ? 'Modifier le budget'
                                    : 'Nouveau budget'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Catégorie</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!!selectedBudget}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner une catégorie" />
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Montant</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Devise</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Période</FormLabel>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
