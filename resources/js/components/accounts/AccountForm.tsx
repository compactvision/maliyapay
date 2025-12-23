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
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

const accountTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Banque' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'saving', label: 'Épargne' },
    { value: 'other', label: 'Autre' },
];

const currencies = ['USD', 'EUR', 'CDF'];

const createAccountSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    type: z.string().min(1, 'Le type est requis'),
    color: z.string().min(1, 'La couleur est requise'),
    initial_currency: z.string().length(3, 'Code devise invalide'),
    initial_balance: z.string().optional(),
});

interface AccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AccountForm({
    open,
    onOpenChange,
    onSuccess,
}: AccountFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            name: '',
            type: 'cash',
            color: mockColors[0],
            initial_currency: 'USD',
            initial_balance: '0',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: '',
                type: 'cash',
                color: mockColors[0],
                initial_currency: 'USD',
                initial_balance: '0',
            });
            setFormError(null);
        }
    }, [open, form]);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            await axios.post('/api/accounts', values);
            if (onSuccess) onSuccess();
            onOpenChange(false);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        Nouveau compte
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-3 sm:space-y-4"
                    >
                        {formError && (
                            <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-500 sm:p-3 sm:text-sm">
                                {formError}
                            </div>
                        )}
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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
                                Créer
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
