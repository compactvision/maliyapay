import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useCategoryForm,
    useCategoryMutations,
    type CategoryFormValues,
} from '@/hooks/useCategories';
import type { Category } from '@/types/category';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

interface CategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess?: () => void;
}

export function CategoryForm({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryFormProps) {
    const form = useCategoryForm();
    const { createCategory, updateCategory, isSubmitting } =
        useCategoryMutations();

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    type: category.type as 'income' | 'expense',
                    color: category.color,
                });
            } else {
                form.reset({
                    name: '',
                    type: 'expense',
                    color: mockColors[0],
                });
            }
        }
    }, [open, category, form]);

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            if (category) {
                await updateCategory(category.id, values);
                toast.success('Catégorie modifiée avec succès');
            } else {
                await createCategory(values);
                toast.success('Catégorie créée avec succès');
            }
            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save category:', err);
            toast.error("Erreur lors de l'enregistrement de la catégorie");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        {category
                            ? 'Modifier la catégorie'
                            : 'Nouvelle catégorie'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-3 sm:space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Nom
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Alimentation"
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Type
                                    </FormLabel>
                                    <Tabs
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <TabsList className="grid h-9 w-full grid-cols-2 sm:h-10">
                                            <TabsTrigger
                                                value="expense"
                                                className="text-sm"
                                            >
                                                Dépense
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="income"
                                                className="text-sm"
                                            >
                                                Revenu
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Couleur
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {mockColors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`h-9 w-9 rounded-full transition-transform sm:h-10 sm:w-10 ${field.value === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    onClick={() =>
                                                        field.onChange(color)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 flex-1 text-sm sm:h-10"
                                onClick={() => onOpenChange(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                className="h-9 flex-1 text-sm sm:h-10"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                                )}
                                {category ? 'Modifier' : 'Ajouter'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
