import { useState } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/AppLayout';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

// --- Mock Data ---
const mockCategories = [
  { id: 'cat_1', name: 'Courses' },
  { id: 'cat_2', name: 'Salaire' },
  { id: 'cat_3', name: 'Loisir' },
  { id: 'cat_4', name: 'Transport' },
  { id: 'cat_5', name: 'Logement' },
];

const mockAccounts = [
  { id: 'acc_1', name: 'Compte Courant' },
  { id: 'acc_2', name: 'Livret A' },
  { id: 'acc_3', name: 'Compte Épargne' },
];

const mockTransactions = [
  { id: 'tx_1', type: 'expense', amount: 120.50, description: 'Courses Carrefour', categoryId: 'cat_1', accountId: 'acc_1', date: new Date() },
  { id: 'tx_2', type: 'income', amount: 2500.00, description: 'Salaire Octobre', categoryId: 'cat_2', accountId: 'acc_1', date: new Date() },
  { id: 'tx_3', type: 'expense', amount: 45.00, description: 'Cinéma', categoryId: 'cat_3', accountId: 'acc_1', date: subMonths(new Date(), 1) },
  { id: 'tx_4', type: 'expense', amount: 60.00, description: 'Abonnement Sncf', categoryId: 'cat_4', accountId: 'acc_1', date: subMonths(new Date(), 1) },
  { id: 'tx_5', type: 'expense', amount: 850.00, description: 'Loyer', categoryId: 'cat_5', accountId: 'acc_1', date: subMonths(new Date(), 2) },
];

// --- Helper Function ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function TransactionPage() {
  // --- State Management ---
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // --- Event Handlers (Simulated) ---
  const handleFormClose = () => {
    setFormOpen(false);
    setEditTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    console.log('Éditer la transaction:', transaction);
    setEditTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Supprimer la transaction avec l\'ID:', id);
    // Dans une vraie app, vous mettriez à jour le state ici
  };

  // --- Derived State (Calculations) ---
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.categoryId === categoryFilter;
    const matchesMonth = format(new Date(transaction.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM');

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <Button onClick={() => setFormOpen(true)} className="gap-2" variant="primary">
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
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <h2 className="text-lg font-semibold capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="mt-1 flex items-center justify-center gap-4 text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(income)}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(expenses)}
                  </span>
                  <span className="font-medium">
                    = {formatCurrency(income - expenses)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {mockCategories.map((cat) => (
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
            {/* Le composant TransactionList est maintenant autonome et n'a plus besoin de props */}
            <TransactionList />
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