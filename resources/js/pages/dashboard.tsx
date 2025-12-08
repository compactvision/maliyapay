import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { AppLayout } from '@/layouts/AppLayout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowUpRight,
    Plus,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
// import { Transaction } from '@/types/transaction';

export default function Welcome() {
    const [formOpen, setFormOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState();

    const user = [
        {
            name: 'Juan Loze',
            email: 'juan.loze@gmail.com',
            avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const accounts = [
        {
            id: 1,
            name: 'Compte bancaire',
            balance: 1500,
            color: '#FFCDD2',
            type: 'checking',
        },
        {
            id: 2,
            name: "Compte d'epargne",
            balance: 2500,
            color: '#B3E5FC',
            type: 'savings',
        },
    ];

    const totalBalance = accounts.reduce(
        (acc, account) => acc + account.balance,
        0,
    );
    const income = accounts.reduce((acc, account) => acc + account.balance, 0);
    const expenses = accounts.reduce(
        (acc, account) => acc + account.balance,
        0,
    );

    const handleEdit = (transaction: any) => {
        setEditTransaction(transaction);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        // await deleteTransaction(id);
    };

    const handleFormClose = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditTransaction(undefined);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Bonjour, {user[0].name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-muted-foreground">
                            {format(new Date(), 'EEEE d MMMM yyyy', {
                                locale: fr,
                            })}
                        </p>
                    </div>
                    <Button
                        onClick={() => setFormOpen(true)}
                        className="gap-2"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle transaction
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Solde total"
                        value={formatCurrency(totalBalance)}
                        subtitle={`${accounts.length} compte${accounts.length > 1 ? 's' : ''}`}
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        variant="primary"
                    />
                    <StatCard
                        title="Revenus du mois"
                        value={formatCurrency(income)}
                        icon={<TrendingUp className="text-success h-5 w-5" />}
                        variant="income"
                    />
                    <StatCard
                        title="Dépenses du mois"
                        value={formatCurrency(expenses)}
                        icon={
                            <TrendingDown className="h-5 w-5 text-destructive" />
                        }
                        variant="expense"
                    />
                    <StatCard
                        title="Balance"
                        value={formatCurrency(income - expenses)}
                        subtitle={
                            income - expenses >= 0 ? 'Excédent' : 'Déficit'
                        }
                        icon={<ArrowUpRight className="h-5 w-5 text-primary" />}
                    />
                </div>

                {/* Accounts Overview */}
                {accounts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Mes comptes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-full"
                                            style={{
                                                backgroundColor: `${account.color}20`,
                                            }}
                                        >
                                            <Wallet
                                                className="h-5 w-5"
                                                style={{ color: account.color }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {account.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {account.type === 'checking' &&
                                                    'Courant'}
                                                {account.type === 'savings' &&
                                                    'Épargne'}
                                                {account.type === 'credit' &&
                                                    'Crédit'}
                                                {account.type === 'cash' &&
                                                    'Espèces'}
                                                {account.type ===
                                                    'investment' &&
                                                    'Investissement'}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            {formatCurrency(account.balance)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">
                            Transactions récentes
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <a href="/transactions">Voir tout</a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* <TransactionList
                            transactions={recentTransactions}
                            categories={categories}
                            accounts={accounts}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        /> */}
                    </CardContent>
                </Card>
            </div>

            <TransactionForm
                open={formOpen}
                onOpenChange={handleFormClose}
                transaction={editTransaction}
            />
        </AppLayout>
    );
}
