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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, Repeat2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const currencies = ['CDF', 'USD'];

const budgetSchema = z
    .object({
        category_id: z.string().min(1, 'Catégorie requise'),
        amount: z.string().min(1, 'Montant requis'),
        currency: z.string().length(3, 'Devise invalide'),
        period: z.enum(['daily', 'weekly', 'monthly']),
        equivalent_amount: z.string().optional(),
        equivalent_currency: z.string().optional(),
    })
    .superRefine((values, ctx) => {
        if (
            values.equivalent_amount &&
            Number(values.equivalent_amount) > 0 &&
            !values.equivalent_currency
        ) {
            ctx.addIssue({
                code: 'custom',
                message: 'Devise requise',
                path: ['equivalent_currency'],
            });
        }

        if (
            values.equivalent_amount &&
            Number(values.equivalent_amount) > 0 &&
            values.equivalent_currency === values.currency
        ) {
            ctx.addIssue({
                code: 'custom',
                message: 'Choisissez une autre devise',
                path: ['equivalent_currency'],
            });
        }
    });

interface Category {
    id: string;
    name: string;
}

interface Budget {
    id: string;
    category_id: string;
    amount: number;
    currency: string;
    period: 'daily' | 'weekly' | 'monthly';
}

interface BudgetFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    budget?: Budget | null;
    onSuccess?: () => void;
}

export function BudgetForm({
    open,
    onOpenChange,
    budget,
    onSuccess,
}: BudgetFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof budgetSchema>>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            category_id: '',
            amount: '',
            currency: 'CDF',
            period: 'monthly',
            equivalent_amount: '',
            equivalent_currency: 'USD',
        },
    });

    const selectedCurrency = form.watch('currency');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };

        if (open) {
            fetchCategories();
            if (budget) {
                form.reset({
                    category_id: budget.category_id,
                    amount: budget.amount.toString(),
                    currency: budget.currency,
                    period: budget.period,
                    equivalent_amount: '',
                    equivalent_currency:
                        currencies.find(
                            (currency) => currency !== budget.currency,
                        ) ?? 'CDF',
                });
            } else {
                form.reset({
                    category_id: '',
                    amount: '',
                    currency: 'USD',
                    period: 'monthly',
                    equivalent_amount: '',
                    equivalent_currency: 'CDF',
                });
            }
        }
    }, [open, budget, form]);

    useEffect(() => {
        const equivalentCurrency = form.getValues('equivalent_currency');

        if (equivalentCurrency === selectedCurrency) {
            form.setValue(
                'equivalent_currency',
                currencies.find((currency) => currency !== selectedCurrency) ??
                    '',
            );
        }
    }, [form, selectedCurrency]);

    const onSubmit = async (values: z.infer<typeof budgetSchema>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                category_id: values.category_id,
                amount: Number(values.amount),
                currency: values.currency,
                period: values.period,
                ...(values.equivalent_amount &&
                Number(values.equivalent_amount) > 0
                    ? {
                          equivalent_amount: Number(values.equivalent_amount),
                          equivalent_currency: values.equivalent_currency,
                      }
                    : {}),
            };

            if (budget) {
                await axios.put(`/api/budgets/${budget.id}`, payload);
                toast.success('Budget modifié avec succès');
            } else {
                await axios.post('/api/budgets', payload);
                toast.success(
                    values.equivalent_amount &&
                        Number(values.equivalent_amount) > 0
                        ? 'Budgets créés avec succès'
                        : 'Budget créé avec succès',
                );
            }
            if (onSuccess) onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Failed to save budget', error);
            toast.error("Erreur lors de l'enregistrement du budget");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        {budget ? 'Modifier le budget' : 'Nouveau budget'}
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
                                        disabled={!!budget}
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
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!!budget}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-9 text-base sm:h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem
                                                        key={currency}
                                                        value={currency}
                                                    >
                                                        {currency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {!budget && (
                            <div className="rounded-md border border-dashed p-3">
                                <div className="mb-3 flex items-start gap-2">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <Repeat2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Équivalent dans une autre devise
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Optionnel, pour suivre les paiements
                                            faits dans cette devise.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <FormField
                                        control={form.control}
                                        name="equivalent_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Montant équivalent
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
                                        name="equivalent_currency"
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
                                                        {currencies
                                                            .filter(
                                                                (currency) =>
                                                                    currency !==
                                                                    selectedCurrency,
                                                            )
                                                            .map((currency) => (
                                                                <SelectItem
                                                                    key={
                                                                        currency
                                                                    }
                                                                    value={
                                                                        currency
                                                                    }
                                                                >
                                                                    {currency}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
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
    );
}
