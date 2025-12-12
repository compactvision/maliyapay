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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Loader2, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    category_id: string;
    account_id: string;
    currency: string;
    date: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    categories: any[];
    accounts: any[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    onEdit: (transaction: Transaction) => void;
}

export function TransactionList({
    transactions,
    categories,
    accounts,
    isLoading,
    onDelete,
    onEdit,
}: TransactionListProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const getCategoryName = (id: string) => {
        return categories.find((c) => c.id === id)?.name || 'Inconnu';
    };

    const getAccountName = (id: string) => {
        return accounts.find((a) => a.id === id)?.name || 'Inconnu';
    };

    const formatAmount = (amount: number, type: string, currency: string) => {
        const formatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency || 'EUR',
        }).format(amount);
        return type === 'income' ? `+${formatted}` : `-${formatted}`;
    };

    // Group transactions by date
    const groupedTransactions = transactions.reduce(
        (groups, transaction) => {
            const dateKey = format(new Date(transaction.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
            return groups;
        },
        {} as Record<string, typeof transactions>,
    );

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Aucune transaction</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Ajoutez votre première transaction pour commencer
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {Object.entries(groupedTransactions)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([dateKey, dayTransactions]) => (
                        <div key={dateKey} className="space-y-2">
                            <h3 className="px-1 text-sm font-medium text-muted-foreground">
                                {format(new Date(dateKey), 'EEEE d MMMM', {
                                    locale: fr,
                                })}
                            </h3>
                            <div className="space-y-2">
                                {dayTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className={cn(
                                            'group animate-fade-in flex items-start gap-3 rounded-lg border bg-card p-3 transition-all sm:items-center sm:gap-4 sm:p-4',
                                            'border-border transition-all duration-200',
                                            'hover:border-accent-foreground hover:bg-accent/50 hover:shadow-md',
                                            'dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl',
                                        )}
                                    >
                                        {/* Icône */}
                                        <div
                                            className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10',
                                                transaction.type === 'income'
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                                            )}
                                        >
                                            {transaction.type === 'income' ? (
                                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                                            )}
                                        </div>

                                        {/* Contenu principal - responsive layout */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                {/* Description et infos */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium sm:text-base">
                                                        {
                                                            transaction.description
                                                        }
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                                        {getCategoryName(
                                                            transaction.category_id,
                                                        )}
                                                        {' • '}
                                                        {getAccountName(
                                                            transaction.account_id,
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Montant */}
                                                <p
                                                    className={cn(
                                                        'shrink-0 text-sm font-semibold whitespace-nowrap sm:text-base',
                                                        transaction.type ===
                                                            'income'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400',
                                                    )}
                                                >
                                                    {formatAmount(
                                                        transaction.amount,
                                                        transaction.type,
                                                        transaction.currency,
                                                    )}
                                                </p>
                                            </div>

                                            {/* Actions en dessous sur mobile */}
                                            <div className="mt-2 flex gap-1 sm:hidden">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 transition-transform hover:scale-110"
                                                    onClick={() =>
                                                        onEdit(transaction)
                                                    }
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-600 transition-transform hover:scale-110 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    onClick={() =>
                                                        setDeleteId(
                                                            transaction.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Actions au hover sur desktop */}
                                        <div className="hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 transition-transform hover:scale-110"
                                                onClick={() =>
                                                    onEdit(transaction)
                                                }
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 transition-transform hover:scale-110 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                onClick={() =>
                                                    setDeleteId(transaction.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la transaction ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le solde du compte ne
                            sera PAS restauré automatiquement (Implémentation
                            future).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            onClick={() => {
                                if (deleteId) {
                                    onDelete(deleteId);
                                    setDeleteId(null);
                                }
                            }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
