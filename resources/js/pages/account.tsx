import { AccountForm } from '@/components/accounts/AccountForm';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useFormErrorScroll } from '@/hooks/useFormErrorScroll';
import { AppLayout } from '@/layouts/AppLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import axios from 'axios';
import {
    ArrowRightLeft,
    Coins,
    Loader2,
    Plus,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// --- Types ---
interface Balance {
    currency_code: string;
    amount: number;
}

interface Account {
    id: string;
    name: string;
    type: string;
    color: string;
    is_archived: boolean;
    balances: Balance[];
}

// --- Helper Function ---
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// --- Mock Data (for Options) ---
const accountTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Banque' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'saving', label: 'Épargne' },
    { value: 'other', label: 'Autre' },
];

const currencies = ['USD', 'EUR', 'CDF'];

// --- Zod Schema for Add Currency ---
const addCurrencySchema = z.object({
    currency_code: z.string().length(3),
    initial_balance: z.string().optional(),
});

type AddCurrencyFormValues = z.infer<typeof addCurrencySchema>;

const exchangeSchema = z
    .object({
        from_currency: z.string().length(3),
        to_currency: z.string().length(3),
        amount: z.string().refine((value) => Number(value) > 0, {
            message: 'Le montant doit etre superieur a 0.',
        }),
        rate: z.string().refine((value) => Number(value) > 0, {
            message: 'Le taux doit etre superieur a 0.',
        }),
    })
    .refine((values) => values.from_currency !== values.to_currency, {
        path: ['to_currency'],
        message: 'Choisissez deux devises differentes.',
    });

type ExchangeFormValues = z.infer<typeof exchangeSchema>;
type ApiErrorResponse = {
    message?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    return axiosError.response?.data?.message || fallback;
};

const calculateConvertedAmount = (
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    rate: number,
) => {
    if (amount <= 0 || rate <= 0) {
        return 0;
    }

    if (fromCurrency === 'USD' && toCurrency === 'CDF') {
        return amount * rate;
    }

    if (fromCurrency === 'CDF' && toCurrency === 'USD') {
        return amount / rate;
    }

    return amount * rate;
};

const getOppositeCurrency = (
    currency: string,
    availableCurrencies: string[],
    currentOtherCurrency?: string,
) => {
    if (currency === 'USD' && availableCurrencies.includes('CDF')) {
        return 'CDF';
    }

    if (currency === 'CDF' && availableCurrencies.includes('USD')) {
        return 'USD';
    }

    if (currentOtherCurrency && currentOtherCurrency !== currency) {
        return currentOtherCurrency;
    }

    return (
        availableCurrencies.find(
            (availableCurrency) => availableCurrency !== currency,
        ) || ''
    );
};

export default function AccountPage() {
    // --- State Management ---
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
    const [exchangeOpen, setExchangeOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
        null,
    );
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // --- Fetch Data ---
    const fetchAccounts = async () => {
        try {
            const response = await axios.get('/api/accounts');
            setAccounts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const currencyForm = useForm<AddCurrencyFormValues>({
        resolver: zodResolver(addCurrencySchema),
        defaultValues: {
            currency_code: 'CDF',
            initial_balance: '0',
        },
    });

    const exchangeForm = useForm<ExchangeFormValues>({
        resolver: zodResolver(exchangeSchema),
        defaultValues: {
            from_currency: 'USD',
            to_currency: 'CDF',
            amount: '',
            rate: '',
        },
    });

    const selectedAccount = accounts.find(
        (account) => account.id === selectedAccountId,
    );
    const selectedAccountCurrencies =
        selectedAccount?.balances.map((balance) => balance.currency_code) || [];
    const fromCurrency = exchangeForm.watch('from_currency');
    const toCurrency = exchangeForm.watch('to_currency');
    const exchangeAmount = Number(exchangeForm.watch('amount'));
    const exchangeRate = Number(exchangeForm.watch('rate'));
    const convertedAmount = calculateConvertedAmount(
        fromCurrency,
        toCurrency,
        exchangeAmount,
        exchangeRate,
    );
    const rateLabel =
        [fromCurrency, toCurrency].includes('USD') &&
        [fromCurrency, toCurrency].includes('CDF')
            ? 'Taux (1 USD = X CDF)'
            : `Taux (1 ${fromCurrency || 'devise'} = X ${toCurrency || 'devise'})`;

    useFormErrorScroll(currencyForm.formState.errors);
    useFormErrorScroll(exchangeForm.formState.errors);

    // --- Handlers ---
    const handleAddCurrencySubmit = async (values: AddCurrencyFormValues) => {
        if (!selectedAccountId) return;
        setIsSubmitting(true);
        setFormError(null);
        try {
            await axios.post(
                `/api/accounts/${selectedAccountId}/currencies`,
                values,
            );
            await fetchAccounts();
            setAddCurrencyOpen(false);
            currencyForm.reset();
            setSelectedAccountId(null);
            toast.success('La devise a été ajoutée avec succès.');
        } catch (error: unknown) {
            console.error('Failed to add currency', error);
            setFormError(
                getApiErrorMessage(
                    error,
                    "Une erreur est survenue lors de l'ajout de la devise.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExchangeSubmit = async (values: ExchangeFormValues) => {
        if (!selectedAccountId) return;
        setIsSubmitting(true);
        setFormError(null);
        try {
            await axios.post(`/api/accounts/${selectedAccountId}/exchange`, {
                from_currency: values.from_currency,
                to_currency: values.to_currency,
                amount: Number(values.amount),
                rate: Number(values.rate),
            });
            await fetchAccounts();
            setExchangeOpen(false);
            exchangeForm.reset();
            setSelectedAccountId(null);
            toast.success('Le change a ete effectue avec succes.');
        } catch (error: unknown) {
            console.error('Failed to exchange currencies', error);
            setFormError(
                getApiErrorMessage(
                    error,
                    'Une erreur est survenue pendant le change.',
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/accounts/${deleteId}`);
            await fetchAccounts();
            setDeleteId(null);
            toast.success('Le compte a été supprimé.');
        } catch (error: unknown) {
            console.error('Failed to delete account', error);
            const message = getApiErrorMessage(
                error,
                'Une erreur est survenue lors de la suppression du compte.',
            );
            toast.error(message);
        }
    };

    const openAddCurrency = (accountId: string) => {
        setSelectedAccountId(accountId);
        setFormError(null);
        setAddCurrencyOpen(true);
    };

    const openExchange = (account: Account) => {
        const availableCurrencies = account.balances.map(
            (balance) => balance.currency_code,
        );
        const firstCurrency = availableCurrencies.includes('USD')
            ? 'USD'
            : (availableCurrencies[0] ?? 'USD');
        const secondCurrency = getOppositeCurrency(
            firstCurrency,
            availableCurrencies,
        );

        setSelectedAccountId(account.id);
        setFormError(null);
        exchangeForm.reset({
            from_currency: firstCurrency,
            to_currency: secondCurrency,
            amount: '',
            rate: '',
        });
        setExchangeOpen(true);
    };

    const handleFromCurrencyChange = (value: string) => {
        exchangeForm.setValue('from_currency', value, {
            shouldDirty: true,
            shouldValidate: true,
        });
        exchangeForm.setValue(
            'to_currency',
            getOppositeCurrency(
                value,
                selectedAccountCurrencies,
                exchangeForm.getValues('to_currency'),
            ),
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
    };

    const handleToCurrencyChange = (value: string) => {
        exchangeForm.setValue('to_currency', value, {
            shouldDirty: true,
            shouldValidate: true,
        });
        exchangeForm.setValue(
            'from_currency',
            getOppositeCurrency(
                value,
                selectedAccountCurrencies,
                exchangeForm.getValues('from_currency'),
            ),
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Comptes
                        </h1>
                        <p className="text-muted-foreground">
                            Gérez vos comptes et portefeuilles multi-devises
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setFormError(null);
                            setCreateFormOpen(true);
                        }}
                        className="hidden gap-2 bg-emerald-600 hover:bg-emerald-700 lg:inline-flex"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau compte
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <>
                        {/* Accounts Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => (
                                <Card
                                    key={account.id}
                                    className="group relative overflow-hidden"
                                >
                                    <div
                                        className="absolute inset-x-0 top-0 h-1"
                                        style={{
                                            backgroundColor: account.color,
                                        }}
                                    />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            account.color,
                                                    }}
                                                >
                                                    <Wallet className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {account.name}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {accountTypes.find(
                                                            (t) =>
                                                                t.value ===
                                                                account.type,
                                                        )?.label ||
                                                            account.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openExchange(account)
                                                    }
                                                    disabled={
                                                        account.balances
                                                            .length < 2
                                                    }
                                                    title="Changer une devise"
                                                >
                                                    <ArrowRightLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openAddCurrency(
                                                            account.id,
                                                        )
                                                    }
                                                    title="Ajouter une devise"
                                                >
                                                    <Coins className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                                    onClick={() =>
                                                        setDeleteId(account.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            {account.balances.length > 0 ? (
                                                account.balances.map(
                                                    (balance) => (
                                                        <div
                                                            key={
                                                                balance.currency_code
                                                            }
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <span className="font-medium text-muted-foreground">
                                                                {
                                                                    balance.currency_code
                                                                }
                                                            </span>
                                                            <span className="font-bold">
                                                                {formatCurrency(
                                                                    balance.amount,
                                                                    balance.currency_code,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    Aucune devise
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {accounts.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="mb-4 rounded-full bg-muted p-4">
                                        <Wallet className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">
                                        Aucun compte
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Créez votre premier compte pour
                                        commencer
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>

            <AccountForm
                open={createFormOpen}
                onOpenChange={setCreateFormOpen}
                onSuccess={fetchAccounts}
            />

            {/* Add Currency Dialog */}
            <Dialog open={addCurrencyOpen} onOpenChange={setAddCurrencyOpen}>
                <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                            Ajouter une devise
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...currencyForm}>
                        <form
                            onSubmit={currencyForm.handleSubmit(
                                handleAddCurrencySubmit,
                            )}
                            className="space-y-3 sm:space-y-4"
                        >
                            {formError && (
                                <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-500 sm:p-3 sm:text-sm">
                                    {formError}
                                </div>
                            )}
                            <FormField
                                control={currencyForm.control}
                                name="currency_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            Devise
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
                                                {currencies.map((c) => (
                                                    <SelectItem
                                                        key={c}
                                                        value={c}
                                                    >
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={currencyForm.control}
                                name="initial_balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            Solde Initial
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
                            <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 flex-1 text-sm sm:h-10"
                                    onClick={() => setAddCurrencyOpen(false)}
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
                                    Ajouter
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Exchange Dialog */}
            <Dialog open={exchangeOpen} onOpenChange={setExchangeOpen}>
                <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                            Change de devise
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...exchangeForm}>
                        <form
                            onSubmit={exchangeForm.handleSubmit(
                                handleExchangeSubmit,
                            )}
                            className="space-y-3 sm:space-y-4"
                        >
                            {formError && (
                                <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-500 sm:p-3 sm:text-sm">
                                    {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <FormField
                                    control={exchangeForm.control}
                                    name="from_currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs sm:text-sm">
                                                De
                                            </FormLabel>
                                            <Select
                                                onValueChange={
                                                    handleFromCurrencyChange
                                                }
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-base sm:h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectedAccount?.balances.map(
                                                        (balance) => (
                                                            <SelectItem
                                                                key={
                                                                    balance.currency_code
                                                                }
                                                                value={
                                                                    balance.currency_code
                                                                }
                                                            >
                                                                {
                                                                    balance.currency_code
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={exchangeForm.control}
                                    name="to_currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs sm:text-sm">
                                                Vers
                                            </FormLabel>
                                            <Select
                                                onValueChange={
                                                    handleToCurrencyChange
                                                }
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-base sm:h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectedAccount?.balances.map(
                                                        (balance) => (
                                                            <SelectItem
                                                                key={
                                                                    balance.currency_code
                                                                }
                                                                value={
                                                                    balance.currency_code
                                                                }
                                                            >
                                                                {
                                                                    balance.currency_code
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={exchangeForm.control}
                                name="rate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            {rateLabel}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                placeholder="2250"
                                                className="h-9 text-base sm:h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={exchangeForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            Montant a changer
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="10"
                                                className="h-9 text-base sm:h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <div className="rounded-md border bg-muted/30 p-3">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">
                                        Resultat
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            convertedAmount,
                                            toCurrency || 'CDF',
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 flex-1 text-sm sm:h-10"
                                    onClick={() => setExchangeOpen(false)}
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
                                    Valider
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
                            Supprimer le compte ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
