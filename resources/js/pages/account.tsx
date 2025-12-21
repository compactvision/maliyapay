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
import axios from 'axios';
import { Coins, Loader2, Plus, Trash2, Wallet } from 'lucide-react';
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

// --- Zod Schema for Create Account ---
const createAccountSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    type: z.string().min(1, 'Le type est requis'),
    color: z.string().min(1, 'La couleur est requise'),
    initial_currency: z.string().length(3, 'Code devise invalide').optional(),
    initial_balance: z.string().optional(),
});

// --- Zod Schema for Add Currency ---
const addCurrencySchema = z.object({
    currency_code: z.string().length(3),
    initial_balance: z.string().optional(),
});

export default function AccountPage() {
    // --- State Management ---
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
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

    // --- Forms ---
    const createForm = useForm({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            name: '',
            type: 'cash',
            color: mockColors[0],
            initial_currency: 'USD',
            initial_balance: '0',
        },
    });

    const currencyForm = useForm({
        resolver: zodResolver(addCurrencySchema),
        defaultValues: {
            currency_code: 'CDF',
            initial_balance: '0',
        },
    });

    // Auto-scroll to first error
    useFormErrorScroll(createForm.formState.errors);
    useFormErrorScroll(currencyForm.formState.errors);

    // --- Handlers ---
    const handleCreateSubmit = async (values: any) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            await axios.post('/api/accounts', values);
            await fetchAccounts();
            setCreateFormOpen(false);
            createForm.reset();
            toast.success('Le compte a été créé avec succès.');
        } catch (error: any) {
            console.error('Failed to create account', error);
            setFormError(
                error.response?.data?.message ||
                    'Une erreur est survenue lors de la création du compte.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCurrencySubmit = async (values: any) => {
        if (!selectedAccountId) return;
        setIsSubmitting(true);
        setFormError(null);
        try {
            await axios.post(
                `/api/accounts/${selectedAccountId}/currencies`,
                values,
            );
            setAddCurrencyOpen(false);
            currencyForm.reset();
            setSelectedAccountId(null);
            toast.success('La devise a été ajoutée avec succès.');
        } catch (error: any) {
            console.error('Failed to add currency', error);
            setFormError(
                error.response?.data?.message ||
                    "Une erreur est survenue lors de l'ajout de la devise.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            // Assuming delete endpoint exists (not implemented in controller yet? Ah, check task)
            // Wait, repository has delete, handler has delete, Create/AddCurrency implemented. DELETE route was NOT added to api.php explicitly?
            // Route::apiResource includes destroy. So DELETE /api/accounts/{id} works.
            await axios.delete(`/api/accounts/${deleteId}`);
            await fetchAccounts();
            setDeleteId(null);
            toast.success('Le compte a été supprimé.');
        } catch (error: any) {
            console.error('Failed to delete account', error);
            const message =
                error.response?.data?.message ||
                'Une erreur est survenue lors de la suppression du compte.';
            toast.error(message);
        }
    };

    const openAddCurrency = (accountId: string) => {
        setSelectedAccountId(accountId);
        setFormError(null);
        setAddCurrencyOpen(true);
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
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
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

            {/* Create Account Dialog */}
            <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                            Nouveau compte
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form
                            onSubmit={createForm.handleSubmit(
                                handleCreateSubmit,
                            )}
                            className="space-y-3 sm:space-y-4"
                        >
                            {formError && (
                                <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-500 sm:p-3 sm:text-sm">
                                    {formError}
                                </div>
                            )}
                            <FormField
                                control={createForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            Nom du compte
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Portefeuille Principal"
                                                className="h-9 text-base sm:h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={createForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">
                                            Type
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
                                                {accountTypes.map((type) => (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
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
                                    control={createForm.control}
                                    name="initial_currency"
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
                                    control={createForm.control}
                                    name="initial_balance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs sm:text-sm">
                                                Solde
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
                            </div>
                            <FormField
                                control={createForm.control}
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
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 flex-1 text-sm sm:h-10"
                                    onClick={() => setCreateFormOpen(false)}
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
                                    Créer
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

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
