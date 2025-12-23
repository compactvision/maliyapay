import { CategoryForm } from '@/components/categories/CategoryForm';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import { AppLayout } from '@/layouts/AppLayout';
import type { Category } from '@/types/category';
import {
    Edit2,
    Loader2,
    Plus,
    Tags,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CategoryPage() {
    // --- Hooks ---
    const {
        categories,
        isLoading,
        error: fetchError,
        refetch,
    } = useCategories();
    const {
        deleteCategory,
        isSubmitting,
        error: mutationError,
    } = useCategoryMutations();

    // --- State Management ---
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [formOpen, setFormOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // --- Derived State ---
    const expenseCategories = categories.filter(
        (cat) => cat.type === 'expense',
    );
    const incomeCategories = categories.filter((cat) => cat.type === 'income');
    const currentCategories =
        activeTab === 'expense' ? expenseCategories : incomeCategories;

    // --- Form Handling ---
    const openForm = (category?: Category) => {
        setEditCategory(category || null);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteCategory(deleteId);
            toast.success('Catégorie supprimée avec succès');
            await refetch();
            setDeleteId(null);
        } catch (err) {
            console.error('Failed to delete category:', err);
            toast.error('Erreur lors de la suppression de la catégorie');
        }
    };

    // --- Sub-component ---
    const CategoryGrid = ({ items }: { items: Category[] }) => (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((category) => (
                <div
                    key={category.id}
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm sm:p-4 dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl"
                >
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                        style={{ backgroundColor: `${category.color}20` }}
                    >
                        <Tags
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            style={{ color: category.color }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium sm:text-base">
                            {category.name}
                        </p>
                    </div>

                    <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => openForm(category)}
                        >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700 sm:h-8 sm:w-8 dark:text-red-400"
                            onClick={() => setDeleteId(category.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Catégories
                        </h1>
                        <p className="text-muted-foreground">
                            Organisez vos transactions par catégorie
                        </p>
                    </div>
                    <Button
                        onClick={() => openForm()}
                        className="hidden gap-2 bg-emerald-600 hover:bg-emerald-700 lg:inline-flex"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle catégorie
                    </Button>
                </div>

                {(fetchError || mutationError) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">Erreur</p>
                        <p className="text-sm">{fetchError || mutationError}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && (
                    <Card>
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(v as 'income' | 'expense')
                            }
                        >
                            <CardHeader className="pb-0">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    <TabsTrigger
                                        value="expense"
                                        className="gap-2"
                                    >
                                        <TrendingDown className="h-4 w-4" />
                                        Dépenses ({expenseCategories.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="income"
                                        className="gap-2"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        Revenus ({incomeCategories.length})
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <TabsContent value="expense" className="mt-0">
                                    {currentCategories.length > 0 ? (
                                        <CategoryGrid
                                            items={currentCategories}
                                        />
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            Aucune catégorie de dépenses
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="income" className="mt-0">
                                    {currentCategories.length > 0 ? (
                                        <CategoryGrid
                                            items={currentCategories}
                                        />
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            Aucune catégorie de revenus
                                        </div>
                                    )}
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                )}
            </div>

            <CategoryForm
                open={formOpen}
                onOpenChange={setFormOpen}
                category={editCategory}
                onSuccess={refetch}
            />

            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la catégorie ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Vous ne pouvez pas
                            supprimer une catégorie qui contient des
                            transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDelete}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
