import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Montant requis').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Montant invalide'
  ),
  description: z.string().min(1, 'Description requise'),
  accountId: z.string().min(1, 'Compte requis'),
  categoryId: z.string().min(1, 'Catégorie requise'),
  date: z.date(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
}

const mockAccounts = [
  { id: '1', name: 'Compte Courant' },
  { id: '2', name: 'Livret A' },
  { id: '3', name: 'Compte Épargne' },
];

const mockIncomeCategories = [
  { id: 'inc_1', name: 'Salaire' },
  { id: 'inc_2', name: 'Freelance' },
  { id: 'inc_3', name: 'Remboursement' },
];

const mockExpenseCategories = [
  { id: 'exp_1', name: 'Courses' },
  { id: 'exp_2', name: 'Loisir' },
  { id: 'exp_3', name: 'Transport' },
  { id: 'exp_4', name: 'Logement' },
];

const mockAddTransaction = async (data: any) => {
  console.log('Simulation d\'ajout de transaction:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

const mockUpdateTransaction = async (id: string, data: any) => {
  console.log(`Simulation de modification de la transaction ${id}:`, data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type === 'income' ? 'income' : 'expense',
      amount: transaction?.amount?.toString() || '',
      description: transaction?.description || '',
      accountId: transaction?.accountId || '',
      categoryId: transaction?.categoryId || '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      notes: transaction?.notes || '',
    },
  });

  const transactionType = form.watch('type');
  const categories = transactionType === 'income' ? mockIncomeCategories : mockExpenseCategories;

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const data = {
        type: values.type,
        amount: parseFloat(values.amount),
        description: values.description,
        accountId: values.accountId,
        categoryId: values.categoryId,
        date: values.date,
        notes: values.notes,
      };

      let result;
      if (transaction) {
        result = await mockUpdateTransaction(transaction.id, data);
      } else {
        result = await mockAddTransaction(data);
      }

      if (result.success) {
        console.log(transaction ? 'Transaction modifiée avec succès' : 'Transaction ajoutée avec succès');
        onOpenChange(false);
        form.reset();
      } else {
        console.error('Une erreur est survenue lors de la simulation.');
      }
    } catch (error) {
      console.error('Une erreur est survenue:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-screen sm:h-auto sm:max-h-[90vh] w-full overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 shrink-0">
          <DialogTitle className="text-lg sm:text-xl">
            {transaction ? 'Modifier' : 'Nouvelle transaction'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-2.5 sm:space-y-4 pb-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Tabs
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('categoryId', '');
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2 h-9">
                      <TabsTrigger 
                        value="expense"
                        className="text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        Dépense
                      </TabsTrigger>
                      <TabsTrigger 
                        value="income"
                        className="text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                      >
                        Revenu
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Montant (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-9 sm:h-10 text-base sm:text-lg font-semibold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Courses" 
                      className="h-9 sm:h-10"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Compte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Sélect." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Sélect." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-9 sm:h-10 justify-start text-left font-normal text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Choisir</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes..."
                      className="resize-none h-14 sm:h-16 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 border-t bg-background shrink-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 sm:h-11"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="flex-1 h-10 sm:h-11"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}