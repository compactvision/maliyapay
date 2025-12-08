import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
// Les types sont gardés pour la structure, mais les données viendront d'ailleurs
// import { Transaction, Category, Account } from '@/lib/db'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  {
    id: 'tx_1',
    type: 'expense',
    amount: 120.50,
    description: 'Courses Carrefour',
    categoryId: 'cat_1',
    accountId: 'acc_1',
    date: new Date('2023-10-27'),
  },
  {
    id: 'tx_2',
    type: 'income',
    amount: 2500.00,
    description: 'Salaire Octobre',
    categoryId: 'cat_2',
    accountId: 'acc_1',
    date: new Date('2023-10-25'),
  },
  {
    id: 'tx_3',
    type: 'expense',
    amount: 45.00,
    description: 'Cinéma',
    categoryId: 'cat_3',
    accountId: 'acc_1',
    date: new Date('2023-10-25'),
  },
  {
    id: 'tx_4',
    type: 'expense',
    amount: 60.00,
    description: 'Abonnement Sncf',
    categoryId: 'cat_4',
    accountId: 'acc_1',
    date: new Date('2023-10-24'),
  },
  {
    id: 'tx_5',
    type: 'expense',
    amount: 850.00,
    description: 'Loyer',
    categoryId: 'cat_5',
    accountId: 'acc_1',
    date: new Date('2023-10-20'),
  },
];

// Le composant n'a plus besoin de props
export function TransactionList() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Les fonctions utilisent maintenant les données mock
  const getCategoryName = (id: string) => {
    return mockCategories.find((c) => c.id === id)?.name || 'Inconnu';
  };

  const getAccountName = (id: string) => {
    return mockAccounts.find((a) => a.id === id)?.name || 'Inconnu';
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  // Group transactions by date
  const groupedTransactions = mockTransactions.reduce((groups, transaction) => {
    const dateKey = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, typeof mockTransactions>);

  if (mockTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Aucune transaction</h3>
        <p className="text-sm text-muted-foreground mt-1">
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
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                {format(new Date(dateKey), 'EEEE d MMMM', { locale: fr })}
              </h3>
              <div className="space-y-2">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all animate-fade-in",
                      "border-border transition-all duration-200",
                      "hover:bg-accent/50 hover:border-accent-foreground hover:shadow-md",
                      "dark:bg-white/10 dark:border-white/20 dark:backdrop-blur-xl"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        transaction.type === 'income'
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      )}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(transaction.categoryId)} • {getAccountName(transaction.accountId)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold",
                          transaction.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:scale-110 transition-transform"
                        // --- ACTION SIMULÉE ---
                        onClick={() => console.log('Éditer la transaction:', transaction)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:scale-110 transition-transform"
                        onClick={() => setDeleteId(transaction.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le solde du compte sera mis à jour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              onClick={() => {
                if (deleteId) {
                  // --- ACTION SIMULÉE ---
                  console.log('Supprimer la transaction:', deleteId);
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