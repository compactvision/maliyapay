import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { AppLayout } from '@/layouts/AppLayout';
import axios from 'axios';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// --- Helper Function ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export default function StatisticPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState<string>(''); // Default empty, will set from API
    
    const fetchStats = async (curr?: string) => {
        setLoading(true);
        try {
            // Build URL parameters
            const params = new URLSearchParams();
            if (curr) params.append('currency', curr);
            
            const response = await axios.get(`/api/statistics?${params.toString()}`);
            setStats(response.data);
            
            // Set initial currency if not set
            if (!currency && response.data.currency) {
                setCurrency(response.data.currency);
            }
        } catch (error) {
            console.error('Failed to fetch statistics', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCurrencyChange = (value: string) => {
        setCurrency(value);
        fetchStats(value);
    };

    if (loading && !stats) { // Only full page load on initial
        return (
            <AppLayout>
                <div className="flex h-full items-center justify-center p-8">
                    <div className="text-muted-foreground">
                        Chargement des statistiques...
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Helper for dynamic currency
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Statistiques
                        </h1>
                        <p className="text-muted-foreground">
                            Analysez vos habitudes financières
                        </p>
                    </div>
                    {/* Currency Selector */}
                    {stats?.availableCurrencies && stats.availableCurrencies.length > 0 && (
                        <div className="w-full sm:w-auto">
                            <select 
                                value={currency}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[180px]"
                            >
                                {stats.availableCurrencies.map((c: string) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {stats && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Revenus du mois"
                                value={formatMoney(stats.currentIncome)}
                                icon={<TrendingUp className="h-5 w-5" />}
                                trend={{
                                    value: Math.abs(stats.incomeTrend),
                                    isPositive: stats.incomeTrend > 0,
                                }}
                                variant="primary"
                            />
                            <StatCard
                                title="Dépenses du mois"
                                value={formatMoney(stats.currentExpenses)}
                                icon={<TrendingDown className="h-5 w-5" />}
                                trend={{
                                    value: Math.abs(stats.expenseTrend),
                                    isPositive: stats.expenseTrend < 0,
                                }}
                                variant="expense"
                            />
                            <StatCard
                                title="Économies"
                                value={formatMoney(
                                    stats.currentIncome - stats.currentExpenses,
                                )}
                                icon={<BarChart3 className="h-5 w-5" />}
                            />
                            <StatCard
                                title="Transactions"
                                value={stats.transactionCount}
                                subtitle="Ce mois"
                                icon={<PieChart className="h-5 w-5" />}
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Monthly Trend */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Évolution mensuelle ({currency})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.monthlyTrend}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="stroke-muted"
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    className="fill-muted-foreground text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tickFormatter={(value) =>
                                                        `${value / 1000}k`
                                                    }
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) =>
                                                        formatMoney(value)
                                                    }
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--popover))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '0.5rem',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Legend iconType="circle" />
                                                <Bar
                                                    dataKey="income"
                                                    name="Revenus"
                                                    fill="#10b981" // emerald-500
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={50}
                                                />
                                                <Bar
                                                    dataKey="expenses"
                                                    name="Dépenses"
                                                    fill="#ef4444" // red-500
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={50}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Expense by Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Dépenses par catégorie ({currency})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {stats.expensesByCategory.length > 0 ? (
                                        <div className="h-64">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={stats.expensesByCategory}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {stats.expensesByCategory.map(
                                                            (
                                                                entry: any,
                                                                index: number,
                                                            ) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={entry.color}
                                                                    strokeWidth={0}
                                                                />
                                                            ),
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: number) =>
                                                            formatMoney(value)
                                                        }
                                                        contentStyle={{
                                                            backgroundColor: 'hsl(var(--popover))',
                                                            borderColor: 'hsl(var(--border))',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-64 items-center justify-center text-muted-foreground">
                                            Aucune dépense ce mois
                                        </div>
                                    )}
                                    {stats.expensesByCategory.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {stats.expensesByCategory
                                                .slice(0, 6)
                                                .map((cat: any) => (
                                                    <div
                                                        key={cat.name}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    cat.color,
                                                            }}
                                                        />
                                                        <span className="truncate text-muted-foreground">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Daily Spending */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Dépenses 7 derniers jours ({currency})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.dailySpending}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="stroke-muted"
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis className="text-xs" hide />
                                                <Tooltip
                                                    formatter={(value: number) =>
                                                        formatMoney(value)
                                                    }
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--popover))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '0.5rem',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Bar
                                                    dataKey="amount"
                                                    name="Dépenses"
                                                    fill="#3b82f6" // blue-500
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={40}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
