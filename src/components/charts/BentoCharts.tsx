import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Expense } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, PiggyBank, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
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
        percentage: totalSpent > 0 ? Math.round((totals[cat.value] || 0) / totalSpent * 100) : 0,
      }))
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses, totalSpent]);

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
        budget: totalBudget,
      };
    });
  }, [expenses, startDate, endDate, totalBudget]);

  return (
    <div className="space-y-4">
      {/* Main Summary Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Budget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[hsl(var(--tripwise-teal))] to-[hsl(178,100%,18%)]">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">Total Budget</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {currencySymbol}{totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[hsl(var(--tripwise-gold))] to-[hsl(35,90%,55%)]">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-black/60">Spent</p>
                  <p className="text-2xl font-bold text-black mt-1">
                    {currencySymbol}{totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-black/50 mt-0.5">{percentSpent}% of budget</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
                  <TrendingUp className="h-4 w-4 text-black/70" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Remaining */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`relative overflow-hidden border-0 ${remaining >= 0 
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
            : 'bg-gradient-to-br from-rose-500 to-rose-600'}`}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">{remaining >= 0 ? 'Remaining' : 'Over Budget'}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {currencySymbol}{Math.abs(remaining).toLocaleString()}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  {remaining >= 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-white" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Avg/Expense</p>
                  <p className="text-2xl font-bold mt-1">
                    {currencySymbol}{avgPerExpense.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{expenses.length} expenses</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Category Breakdown with Pie */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-semibold mb-4">Spending Breakdown</p>
              {categoryData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold">{categoryData.length}</p>
                        <p className="text-[10px] text-muted-foreground">categories</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.slice(0, 4).map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <span className="text-xs flex-1 truncate">{cat.icon} {cat.name}</span>
                        <span className="text-xs font-medium text-muted-foreground">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[120px] text-sm text-muted-foreground">
                  No expenses yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">Spending Over Time</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Cumulative</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-0.5 bg-muted-foreground/40" style={{ borderStyle: 'dashed' }} />
                    <span className="text-muted-foreground">Budget</span>
                  </div>
                </div>
              </div>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="gradientSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="budget"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="none"
                      strokeOpacity={0.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#gradientSpent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[120px] text-sm text-muted-foreground">
                  No expenses yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
