import { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/AppLayout';
import { Edit2, Loader2, Plus, Trash2, Wallet } from 'lucide-react';

// --- Helper Function ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- Mock Data ---
const mockAccountTypes = [
  { value: 'checking', label: 'Compte Courant' },
  { value: 'savings', label: 'Compte Épargne' },
  { value: 'investment', label: 'Portefeuille' },
];

const mockColors = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const initialAccounts = [
  { id: '1', name: 'Compte Courant BNP', type: 'checking', balance: 2500.75, color: '#3b82f6' },
  { id: '2', name: 'Livret A', type: 'savings', balance: 10000.00, color: '#22c55e' },
  { id: '3', name: 'PEA', type: 'investment', balance: 12500.50, color: '#8b5cf6' },
];

// --- Zod Schema for Form ---
const accountFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.string().min(1, 'Le type est requis'),
  balance: z.string().refine((val) => !isNaN(parseFloat(val)), 'Le solde doit être un nombre'),
  color: z.string().min(1, 'La couleur est requise'),
});

export default function AccountPage() {
  // --- State Management ---
  const [accounts, setAccounts] = useState(initialAccounts);
  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // --- Form Handling ---
  const form = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      balance: '0',
      color: mockColors[0],
    },
  });

  const resetForm = () => {
    form.reset();
    setEditAccount(null);
  };

  const openForm = (account?: any) => {
    if (account) {
      form.setValue('name', account.name);
      form.setValue('type', account.type);
      form.setValue('balance', account.balance.toString());
      form.setValue('color', account.color);
      setEditAccount(account);
    } else {
      resetForm();
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const accountData = { ...values, balance: parseFloat(values.balance) };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    if (editAccount) {
      console.log('Modification du compte:', { id: editAccount.id, ...accountData });
      setAccounts(prev => prev.map(acc => acc.id === editAccount.id ? { ...acc, ...accountData } : acc));
    } else {
      console.log('Ajout du compte:', accountData);
      setAccounts(prev => [...prev, { ...accountData, id: Date.now().toString() }]);
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    console.log('Suppression du compte avec l\'ID:', deleteId);
    setAccounts(prev => prev.filter(acc => acc.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comptes</h1>
            <p className="text-muted-foreground">Gérez vos comptes bancaires et portefeuilles</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nouveau compte
          </Button>
        </div>

        {/* Total Balance Card */}
        <Card className="bg-emerald-600 text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white/80">Solde total</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="mt-1 text-sm text-white/70">{accounts.length} compte{accounts.length > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: account.color }} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: account.color }}>
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{mockAccountTypes.find(t => t.value === account.type)?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(account)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setDeleteId(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
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
              <h3 className="text-lg font-semibold">Aucun compte</h3>
              <p className="mt-1 text-sm text-muted-foreground">Ajoutez votre premier compte pour commencer</p>
              <Button onClick={() => openForm()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un compte
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Form Dialog */}
      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAccount ? 'Modifier le compte' : 'Nouveau compte'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom du compte</FormLabel><FormControl><Input placeholder="Ex: Compte courant BNP" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type de compte</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{mockAccountTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="balance" render={({ field }) => (
                <FormItem><FormLabel>Solde actuel (€)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem><FormLabel>Couleur</FormLabel><FormControl>
                  <div className="flex flex-wrap gap-2">{mockColors.map(color => (
                    <button key={color} type="button" className={`h-8 w-8 rounded-full transition-transform ${field.value === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`} style={{ backgroundColor: color }} onClick={() => field.onChange(color)} />
                  ))}</div>
                </FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editAccount ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. Vous ne pouvez pas supprimer un compte qui contient des transactions.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}