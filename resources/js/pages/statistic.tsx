import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Cell, Legend, Pie } from 'recharts';

// --- Helper Function ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- Mock Data ---
const mockStats = {
  currentIncome: 4500.00,
  currentExpenses: 2200.50,
  incomeTrend: 12.5, // +12.5%
  expenseTrend: -5.2, // -5.2%
  transactionCount: 42,
  monthlyTrend: [
    { name: 'Janvier', income: 4000, expenses: 2100 },
    { name: 'Février', income: 4100, expenses: 2300 },
    { name: 'Mars', income: 4200, expenses: 2050 },
    { name: 'Avril', income: 4400, expenses: 2200 },
    { name: 'Mai', income: 4300, expenses: 2150 },
    { name: 'Juin', income: 4500, expenses: 2200.50 },
  ],
  expensesByCategory: [
    { name: 'Logement', value: 850, color: '#8884d8' }, // indigo
    { name: 'Courses', value: 650, color: '#ef4444' }, // red
    { name: 'Transport', value: 250, color: '#f59e0b' }, // amber
    { name: 'Loisir', value: 200, color: '#10b981' }, // emerald
    { name: 'Autres', value: 250.50, color: '#6b7280' }, // gray
  ],
  dailySpending: [
    { name: 'Lun', amount: 120 },
    { name: 'Mar', amount: 85.50 },
    { name: 'Mer', amount: 45 },
    { name: 'Jeu', amount: 150 },
    { name: 'Ven', amount: 90 },
    { name: 'Sam', amount: 250 },
    { name: 'Dim', amount: 60 },
  ],
};

export default function StatisticPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez vos habitudes financières
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenus du mois"
            value={formatCurrency(mockStats.currentIncome)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{
              value: Math.round(mockStats.incomeTrend),
              isPositive: mockStats.incomeTrend > 0,
            }}
            variant="primary"
          />
          <StatCard
            title="Dépenses du mois"
            value={formatCurrency(mockStats.currentExpenses)}
            icon={<TrendingDown className="h-5 w-5" />}
            trend={{
              value: Math.round(Math.abs(mockStats.expenseTrend)),
              isPositive: mockStats.expenseTrend < 0,
            }}
            variant="expense"
          />
          <StatCard
            title="Économies"
            value={formatCurrency(mockStats.currentIncome - mockStats.currentExpenses)}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            title="Transactions"
            value={mockStats.transactionCount}
            subtitle="Ce mois"
            icon={<PieChart className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Évolution mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="fill-muted-foreground text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Bar dataKey="income" name="Revenus" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Dépenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dépenses par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {mockStats.expensesByCategory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockStats.expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockStats.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">Aucune dépense ce mois</div>
              )}
              {mockStats.expensesByCategory.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {mockStats.expensesByCategory.slice(0, 6).map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="truncate text-muted-foreground">{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Spending */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dépenses de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStats.dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                    <Bar dataKey="amount" name="Dépenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}