import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, ExpenseCategory } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, PiggyBank, Receipt } from 'lucide-react';

interface BentoChartsProps {
  expenses: Expense[];
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export function BentoCharts({
  expenses,
  totalBudget,
  currency,
  startDate,
  endDate,
}: BentoChartsProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const avgPerExpense = expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;

  // Category breakdown data
  const categoryData = useMemo(() => {
    const totals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return expenseCategories
      .map((cat) => ({
        name: cat.label,
        value: totals[cat.value] || 0,
        color: cat.color,
        icon: cat.icon,
      }))
      .filter((cat) => cat.value > 0);
  }, [expenses]);

  // Daily spending for sparkline
  const dailyData = useMemo(() => {
    if (!startDate || !endDate) return [];

    const days = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });

    let cumulative = 0;
    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayTotal = expenses
        .filter((e) => format(parseISO(e.date), 'yyyy-MM-dd') === dayKey)
        .reduce((sum, e) => sum + e.amount, 0);
      
      cumulative += dayTotal;
      
      return {
        date: format(day, 'MMM d'),
        cumulative,
      };
    });
  }, [expenses, startDate, endDate]);

  // Top categories for bar chart
  const topCategories = useMemo(() => {
    return categoryData.slice(0, 4);
  }, [categoryData]);

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Budget Summary Cards - Top Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold">{currencySymbol}{totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="h-full bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-primary">{currencySymbol}{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`h-full bg-gradient-to-br ${remaining >= 0 ? 'from-success/10 to-success/5' : 'from-destructive/10 to-destructive/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${remaining >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                <PiggyBank className={`h-5 w-5 ${remaining >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{remaining >= 0 ? 'Remaining' : 'Over Budget'}</p>
                <p className={`text-xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {currencySymbol}{Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="h-full bg-gradient-to-br from-muted/50 to-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg/Expense</p>
                <p className="text-xl font-bold">{currencySymbol}{avgPerExpense.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pie Chart - Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-2 lg:col-span-1"
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {categoryData.slice(0, 3).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="truncate max-w-[60px]">{cat.icon}</span>
                      </div>
                      <span className="font-medium">{currencySymbol}{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar Chart - Top Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="col-span-2 lg:col-span-1"
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={topCategories} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="icon" width={24} tick={{ fontSize: 14 }} />
                  <Tooltip
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Area Chart - Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-2"
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Total']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
