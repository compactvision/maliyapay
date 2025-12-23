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
import { useEffect, useRef, useState } from 'react';

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
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Minimum de distance de swipe (en pixels)
    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swipe vers la gauche = mois suivant
            setCurrentMonth(addMonths(currentMonth, 1));
        }
        if (isRightSwipe) {
            // Swipe vers la droite = mois précédent
            setCurrentMonth(subMonths(currentMonth, 1));
        }
    };

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
                        className="hidden gap-2 lg:inline-flex"
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle transaction
                    </Button>
                </div>

                {/* Month Navigation */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div
                            ref={containerRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="flex items-center justify-between gap-2"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
                                onClick={() =>
                                    setCurrentMonth(subMonths(currentMonth, 1))
                                }
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>

                            <div className="min-w-0 flex-1 text-center">
                                <h2 className="text-base font-semibold capitalize sm:text-lg">
                                    {format(currentMonth, 'MMMM yyyy', {
                                        locale: fr,
                                    })}
                                </h2>
                                <div className="mt-1 flex flex-col items-center justify-center gap-1.5 text-xs sm:mt-2 sm:gap-2 sm:text-sm">
                                    {Object.entries(totals).map(
                                        ([currency, { income, expenses }]: [
                                            string,
                                            any,
                                        ]) => (
                                            <div
                                                key={currency}
                                                className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
                                            >
                                                <span className="w-8 text-right font-bold text-muted-foreground sm:w-10">
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
                                className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
                                onClick={() =>
                                    setCurrentMonth(addMonths(currentMonth, 1))
                                }
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>

                        {/* Indicateur de swipe (optionnel) */}
                        <div className="mt-2 text-center text-[10px] text-muted-foreground sm:hidden">
                            ← Glissez pour changer de mois →
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
                            className="pl-10 text-base"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full text-base sm:w-40">
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
                        <SelectTrigger className="w-full text-base sm:w-48">
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
