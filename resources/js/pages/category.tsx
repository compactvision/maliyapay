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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useCategories,
    useCategoryForm,
    useCategoryMutations,
    type CategoryFormValues,
} from '@/hooks/useCategories';
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

// --- Mock Colors ---
const mockColors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
];

export default function CategoryPage() {
    // --- Hooks ---
    const {
        categories,
        isLoading,
        error: fetchError,
        refetch,
    } = useCategories();
    const {
        createCategory,
        updateCategory,
        deleteCategory,
        isSubmitting,
        error: mutationError,
    } = useCategoryMutations();
    const form = useCategoryForm();

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

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            if (editCategory) {
                await updateCategory(editCategory.id, values);
            } else {
                await createCategory(values);
            }
            await refetch();
            closeForm();
        } catch (err) {
            console.error('Failed to save category:', err);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteCategory(deleteId);
            await refetch();
            setDeleteId(null);
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    // --- Sub-component ---
    const CategoryGrid = ({ items }: { items: Category[] }) => (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((category) => (
                <div
                    key={category.id}
                    className="group flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-sm dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl"
                >
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${category.color}20` }}
                    >
                        <Tags
                            className="h-5 w-5"
                            style={{ color: category.color }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{category.name}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openForm(category)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => setDeleteId(category.id)}
                        >
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
                        <h1 className="text-2xl font-bold tracking-tight">
                            Catégories
                        </h1>
                        <p className="text-muted-foreground">
                            Organisez vos transactions par catégorie
                        </p>
                    </div>
                    <Button
                        onClick={() => openForm()}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle catégorie
                    </Button>
                </div>

                {/* Error Display */}
                {(fetchError || mutationError) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">Erreur</p>
                        <p className="text-sm">{fetchError || mutationError}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* Categories Tabs */}
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

            {/* Category Form Dialog */}
            <Dialog open={formOpen} onOpenChange={closeForm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editCategory
                                ? 'Modifier la catégorie'
                                : 'Nouvelle catégorie'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Alimentation"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Tabs
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="expense">
                                                    Dépense
                                                </TabsTrigger>
                                                <TabsTrigger value="income">
                                                    Revenu
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Couleur</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-2">
                                                {mockColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className={`h-8 w-8 rounded-full transition-transform ${field.value === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`}
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                        onClick={() =>
                                                            field.onChange(
                                                                color,
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                    {editCategory ? 'Modifier' : 'Ajouter'}
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
