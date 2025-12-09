import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AppLayout } from '@/layouts/AppLayout';
import axios from 'axios';
import { addMonths, format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Helper Function ---
const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export default function TransactionPage() {
    // --- State Management ---
    const [formOpen, setFormOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Data State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [totals, setTotals] = useState<
        Record<string, { income: number; expenses: number }>
    >({});
    const [isLoading, setIsLoading] = useState(false);

    // --- Fetch Data ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const monthStr = format(currentMonth, 'yyyy-MM');
            const response = await axios.get(
                `/api/transactions?month=${monthStr}`,
            );
            setTransactions(response.data.data);
            setTotals(response.data.meta.totals);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [catRes, accRes] = await Promise.all([
                axios.get('/api/categories'),
                axios.get('/api/accounts'),
            ]);
            setCategories(catRes.data.data);
            setAccounts(accRes.data.data);
        } catch (error) {
            console.error('Failed to fetch filters', error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [currentMonth]);

    // --- Event Handlers ---
    const handleFormClose = () => {
        setFormOpen(false);
        setEditTransaction(null);
    };

    const handleEdit = (transaction: any) => {
        setEditTransaction(transaction);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/transactions/${id}`);
            fetchTransactions(); // Refresh list
        } catch (error) {
            console.error('Failed to delete transaction', error);
        }
    };

    // --- Derived State (Calculations) ---
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch = transaction.description
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesType =
            typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory =
            categoryFilter === 'all' ||
            transaction.category_id === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Transactions
                        </h1>
                        <p className="text-muted-foreground">
                            Gérez vos revenus et dépenses
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

                {/* Month Navigation */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    setCurrentMonth(subMonths(currentMonth, 1))
                                }
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="text-center">
                                <h2 className="text-lg font-semibold capitalize">
                                    {format(currentMonth, 'MMMM yyyy', {
                                        locale: fr,
                                    })}
                                </h2>
                                <div className="mt-1 flex flex-col items-center justify-center gap-2 text-sm">
                                    {Object.entries(totals).map(
                                        ([currency, { income, expenses }]: [
                                            string,
                                            any,
                                        ]) => (
                                            <div
                                                key={currency}
                                                className="flex gap-4"
                                            >
                                                <span className="w-10 text-right font-bold text-muted-foreground">
                                                    {currency}
                                                </span>
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    +
                                                    {formatCurrency(
                                                        income,
                                                        currency,
                                                    )}
                                                </span>
                                                <span className="text-red-600 dark:text-red-400">
                                                    -
                                                    {formatCurrency(
                                                        expenses,
                                                        currency,
                                                    )}
                                                </span>
                                                <span className="font-medium">
                                                    ={' '}
                                                    {formatCurrency(
                                                        income - expenses,
                                                        currency,
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    setCurrentMonth(addMonths(currentMonth, 1))
                                }
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="income">Revenus</SelectItem>
                            <SelectItem value="expense">Dépenses</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Toutes catégories
                            </SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Transaction List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {filteredTransactions.length} transaction
                            {filteredTransactions.length !== 1 && 's'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransactionList
                            transactions={filteredTransactions}
                            categories={categories}
                            accounts={accounts}
                            isLoading={isLoading}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </CardContent>
                </Card>
            </div>

            <TransactionForm
                open={formOpen}
                onOpenChange={handleFormClose}
                transaction={editTransaction}
                onSuccess={fetchTransactions}
            />
        </AppLayout>
    );
}
