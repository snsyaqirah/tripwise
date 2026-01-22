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
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

interface BudgetChartsProps {
  expenses: Expense[];
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
  categoryBudgets?: Record<ExpenseCategory, number>;
}

export function BudgetCharts({
  expenses,
  totalBudget,
  currency,
  startDate,
  endDate,
  categoryBudgets,
}: BudgetChartsProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

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

  // Daily spending data
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
        daily: dayTotal,
        cumulative,
        budget: totalBudget,
      };
    });
  }, [expenses, startDate, endDate, totalBudget]);

  // Budget vs Actual by category
  const budgetComparisonData = useMemo(() => {
    const totals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // If no category budgets provided, distribute evenly
    const defaultBudget = totalBudget / expenseCategories.length;

    return expenseCategories.map((cat) => ({
      category: cat.label,
      icon: cat.icon,
      budget: categoryBudgets?.[cat.value as ExpenseCategory] || defaultBudget,
      spent: totals[cat.value] || 0,
      color: cat.color,
    }));
  }, [expenses, categoryBudgets, totalBudget]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Category Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${currencySymbol}${value.toLocaleString()}`,
                        'Amount',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.icon} {cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget vs Spent Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${currencySymbol}${value.toLocaleString()}`,
                  ]}
                />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cumulative Spending Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Spending Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(value) => `${currencySymbol}${value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${currencySymbol}${value.toLocaleString()}`,
                      name === 'cumulative' ? 'Total Spent' : name === 'budget' ? 'Budget' : 'Daily',
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    name="Budget"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Total Spent"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorSpent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold">
                  {currencySymbol}{totalBudget.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-3xl font-bold text-primary">
                  {currencySymbol}{totalSpent.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className={`text-3xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {currencySymbol}{Math.abs(totalBudget - totalSpent).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalBudget - totalSpent >= 0 ? 'Remaining' : 'Over Budget'}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10">
                <div className="text-3xl font-bold text-accent-foreground">
                  {expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Avg per Expense</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
