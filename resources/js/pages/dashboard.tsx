import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { AppLayout } from '@/layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowUpRight,
    Plus,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<any>().props;
    const user = auth.user;

    const [formOpen, setFormOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<any>(null);

    // Data State
    const [accounts, setAccounts] = useState<any[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<{
        income: Record<string, number>;
        expenses: Record<string, number>;
    }>({
        income: {},
        expenses: {},
    });
    const [isLoading, setIsLoading] = useState(true);

    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const fetchData = async () => {
        try {
            const [dashboardRes, categoriesRes] = await Promise.all([
                axios.get('/api/dashboard'),
                axios.get('/api/categories'),
            ]);

            setAccounts(dashboardRes.data.accounts);
            setRecentTransactions(dashboardRes.data.recent_transactions);
            setStats(dashboardRes.data.stats);
            setCategories(categoriesRes.data.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (transaction: any) => {
        setEditTransaction(transaction);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/transactions/${id}`);
            fetchData(); // Refresh list to show reimbursement
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleFormClose = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditTransaction(null);
        }
    };

    const handleTransactionSuccess = () => {
        fetchData();
    };

    // Calculate total balance display (aggregating all balances)
    // For MVP, we just list them in the card if multiple.
    const renderMultiCurrencyValue = (
        values: Record<string, number> | undefined,
        type: 'total' | 'income' | 'expense' | 'balance' = 'total',
    ) => {
        if (!values || Object.keys(values).length === 0) return '0,00 $';

        return (
            <div className="flex flex-col gap-0.5">
                {Object.entries(values).map(([currency, amount]) => (
                    <span key={currency} className="text-lg">
                        {type === 'income'
                            ? '+'
                            : type === 'expense'
                              ? '-'
                              : ''}
                        {formatCurrency(amount, currency)}
                    </span>
                ))}
            </div>
        );
    };

    // Calculate simple Balance (Income - Expense) per currency
    const calculateBalanceStats = () => {
        const balances: Record<string, number> = {};
        const allCurrencies = new Set([
            ...Object.keys(stats.income),
            ...Object.keys(stats.expenses),
        ]);

        allCurrencies.forEach((currency) => {
            const inc = stats.income[currency] || 0;
            const exp = stats.expenses[currency] || 0;
            balances[currency] = inc - exp;
        });

        return balances;
    };

    // Aggregate account balances by currency for "Solde total"
    const calculateTotalBalance = () => {
        const totals: Record<string, number> = {};
        accounts.forEach((acc) => {
            acc.balances.forEach((bal: any) => {
                if (!totals[bal.currency]) totals[bal.currency] = 0;
                totals[bal.currency] += parseFloat(bal.amount);
            });
        });
        return totals;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-muted-foreground">
                            {format(new Date(), 'EEEE d MMMM yyyy', {
                                locale: fr,
                            })}
                        </p>
                    </div>
                    <Button
                        onClick={() => setFormOpen(true)}
                        className="hidden gap-2 lg:inline-flex"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle transaction
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="mt-2 h-8 w-[120px]" />
                                        <Skeleton className="mt-1 h-3 w-[80px]" />
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Solde total"
                                value={renderMultiCurrencyValue(
                                    calculateTotalBalance(),
                                )}
                                subtitle={`${accounts.length} compte${accounts.length > 1 ? 's' : ''}`}
                                icon={
                                    <Wallet className="h-5 w-5 text-primary" />
                                }
                                variant="primary"
                            />
                            <StatCard
                                title="Revenus du mois"
                                value={renderMultiCurrencyValue(
                                    stats.income,
                                    'income',
                                )}
                                icon={
                                    <TrendingUp className="text-success h-5 w-5" />
                                }
                                variant="income"
                            />
                            <StatCard
                                title="Dépenses du mois"
                                value={renderMultiCurrencyValue(
                                    stats.expenses,
                                    'expense',
                                )}
                                icon={
                                    <TrendingDown className="h-5 w-5 text-destructive" />
                                }
                                variant="expense"
                            />
                            <StatCard
                                title="Balance Mensuelle"
                                value={renderMultiCurrencyValue(
                                    calculateBalanceStats(),
                                    'balance',
                                )}
                                icon={
                                    <ArrowUpRight className="h-5 w-5 text-primary" />
                                }
                            />
                        </>
                    )}
                </div>

                {/* Accounts Overview */}
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex h-[88px] items-center gap-3 rounded-lg border p-3 sm:p-4"
                                    >
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                            <Skeleton className="h-3 w-[60px]" />
                                        </div>
                                        <div className="ml-auto">
                                            <Skeleton className="h-5 w-[80px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    accounts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Mes comptes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                    {accounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 sm:p-4"
                                        >
                                            {/* Icône et nom - flex-1 pour éviter le débordement */}
                                            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                                                    style={{
                                                        backgroundColor: `${account.color}20`,
                                                    }}
                                                >
                                                    <Wallet
                                                        className="h-4 w-4 sm:h-5 sm:w-5"
                                                        style={{
                                                            color: account.color,
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium sm:text-base">
                                                        {account.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize sm:text-sm">
                                                        {account.type}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Solde à droite */}
                                            <div className="shrink-0 text-right">
                                                {account.balances.map(
                                                    (bal: any) => (
                                                        <div
                                                            key={bal.currency}
                                                            className="text-sm font-semibold whitespace-nowrap sm:text-base"
                                                        >
                                                            {formatCurrency(
                                                                bal.amount,
                                                                bal.currency,
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                )}

                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">
                            Transactions récentes
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/transaction">Voir tout</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <TransactionList
                            transactions={recentTransactions}
                            categories={categories}
                            accounts={accounts}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            </div>

            <TransactionForm
                open={formOpen}
                onOpenChange={handleFormClose}
                transaction={editTransaction}
                onSuccess={handleTransactionSuccess}
            />
        </AppLayout>
    );
}
