import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z
        .string()
        .min(1, 'Montant requis')
        .refine(
            (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
            'Montant invalide',
        ),
    currency: z.string().min(1, 'Devise requise'),
    description: z.string().min(1, 'Description requise'),
    accountId: z.string().min(1, 'Compte requis'),
    categoryId: z.string().min(1, 'Catégorie requise'),
    date: z.date(),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: any;
    onSuccess?: () => void;
}

export function TransactionForm({
    open,
    onOpenChange,
    transaction,
    onSuccess,
}: TransactionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: transaction?.type === 'income' ? 'income' : 'expense',
            amount: transaction?.amount?.toString() || '',
            currency: transaction?.currency || 'CDF',
            description: transaction?.description || '',
            accountId: transaction?.accountId || '',
            categoryId: transaction?.categoryId || '',
            date: transaction?.date ? new Date(transaction.date) : new Date(),
            notes: transaction?.notes || '',
        },
    });

    useEffect(() => {
        if (open) {
            fetchData();
            if (transaction) {
                form.reset({
                    type: transaction.type === 'income' ? 'income' : 'expense',
                    amount: transaction.amount.toString(),
                    currency: transaction.currency,
                    description: transaction.description,
                    accountId: transaction.accountId || transaction.account_id,
                    categoryId:
                        transaction.categoryId || transaction.category_id,
                    date: new Date(transaction.date),
                    notes: transaction.notes || '',
                });
            } else {
                form.reset({
                    type: 'expense',
                    amount: '',
                    currency: 'CDF',
                    description: '',
                    accountId: '',
                    categoryId: '',
                    date: new Date(),
                    notes: '',
                });
            }
        }
    }, [open, transaction, form]);

    const fetchData = async () => {
        try {
            const [accRes, catRes] = await Promise.all([
                axios.get('/api/accounts'),
                axios.get('/api/categories'),
            ]);
            setAccounts(accRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const transactionType = form.watch('type');
    const filteredCategories = categories.filter(
        (c) => c.type === transactionType,
    );

    const handleSubmit = form.handleSubmit(async (values: FormValues) => {
        setIsSubmitting(true);
        form.clearErrors();
        try {
            const data = {
                type: values.type,
                amount: values.amount,
                currency: values.currency,
                description: values.description,
                account_id: values.accountId,
                category_id: values.categoryId,
                date: format(values.date, 'yyyy-MM-dd HH:mm:ss'),
                notes: values.notes,
            };

            if (transaction) {
                await axios.put(`/api/transactions/${transaction.id}`, data);
            } else {
                await axios.post('/api/transactions', data);
            }

            toast({
                title: 'Succès',
                description: 'Transaction enregistrée',
            });

            onOpenChange(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error submitting transaction:', error);
            const errorMessage =
                error.response?.data?.message || 'Une erreur est survenue';

            form.setError('root', {
                type: 'manual',
                message: errorMessage,
            });

            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-screen w-full flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-[425px]">
                <DialogHeader className="shrink-0 px-3 pt-3 pb-2 sm:px-6 sm:pt-6">
                    <DialogTitle className="text-base sm:text-xl">
                        {transaction ? 'Modifier' : 'Nouvelle transaction'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2 sm:space-y-4 sm:px-6 sm:pb-4">
                        {form.formState.errors.root && (
                            <div className="rounded-md bg-destructive/15 p-2 text-xs text-destructive dark:bg-destructive/10 sm:p-3 sm:text-sm">
                                <div className="flex gap-2">
                                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span>
                                        {form.formState.errors.root.message}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <Tabs
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            form.setValue('categoryId', '');
                                        }}
                                    >
                                        <TabsList className="grid h-8 w-full grid-cols-2 sm:h-9">
                                            <TabsTrigger
                                                value="expense"
                                                className="text-xs sm:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white"
                                            >
                                                Dépense
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="income"
                                                className="text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                            >
                                                Revenu
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">
                                            Montant
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="h-8 text-base font-semibold sm:h-10 sm:text-lg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">
                                            Devise
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-base sm:h-10">
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
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Courses"
                                            className="h-8 text-base sm:h-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] sm:text-xs" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">
                                            Compte
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-base sm:h-10">
                                                    <SelectValue placeholder="Sélect." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem
                                                        key={account.id}
                                                        value={account.id}
                                                    >
                                                        {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">
                                            Catégorie
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-base sm:h-10">
                                                    <SelectValue placeholder="Sélect." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredCategories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">
                                        Date
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'h-8 w-full justify-start text-left text-base font-normal sm:h-10 sm:text-sm',
                                                        !field.value &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'dd/MM/yyyy',
                                                        )
                                                    ) : (
                                                        <span>Choisir</span>
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                locale={fr}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-[10px] sm:text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">
                                        Notes (optionnel)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notes..."
                                            className="h-12 resize-none text-base sm:h-16 sm:text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] sm:text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex shrink-0 gap-2 border-t bg-background p-2.5 sm:gap-3 sm:p-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 flex-1 text-xs sm:h-11 sm:text-sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            className="h-9 flex-1 text-xs sm:h-11 sm:text-sm"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                            )}
                            {transaction ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}