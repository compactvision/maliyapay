import { BudgetForm } from '@/components/budgets/BudgetForm';
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
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/AppLayout';
import axios from 'axios';
import { Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

export default function Budget() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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
        setOpen(true);
    };

    const handleNewBudget = () => {
        setSelectedBudget(null);
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
                            Gérez vos limites de petites dépenses par catégorie
                        </p>
                    </div>
                    <Button
                        onClick={handleNewBudget}
                        className="hidden gap-2 lg:inline-flex"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
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

                <BudgetForm
                    open={open}
                    onOpenChange={setOpen}
                    budget={selectedBudget}
                    onSuccess={fetchData}
                />

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
