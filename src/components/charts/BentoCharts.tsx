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
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, PiggyBank, Receipt, Flame, Calendar, Target } from 'lucide-react';

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
  const tripDays = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  const dailyBudget = totalBudget / tripDays;
  const dailyAvgSpent = expenses.length > 0 ? totalSpent / tripDays : 0;

  // Category breakdown
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
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Daily spending sparkline
  const dailyData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    let cumulative = 0;
    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayTotal = expenses
        .filter((e) => format(parseISO(e.date), 'yyyy-MM-dd') === dayKey)
        .reduce((sum, e) => sum + e.amount, 0);
      cumulative += dayTotal;
      return { date: format(day, 'd'), daily: dayTotal, cumulative };
    });
  }, [expenses, startDate, endDate]);

  // Top expense
  const topExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0]);
  }, [expenses]);

  // Budget gauge data
  const gaugeData = [{ value: Math.min(percentSpent, 100), fill: percentSpent > 90 ? 'hsl(var(--destructive))' : percentSpent > 70 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }];

  const cardBase = "relative overflow-hidden";

  return (
    <div className="grid gap-3 grid-cols-4 lg:grid-cols-6 auto-rows-[80px]">
      {/* Budget Gauge - 2x2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-2 row-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Budget Used</p>
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex items-center justify-center -mt-2">
              <div className="relative">
                <ResponsiveContainer width={100} height={100}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pt-3">
                  <span className="text-2xl font-bold">{percentSpent}%</span>
                </div>
              </div>
            </div>
            <div className="text-center -mt-4">
              <p className="text-[10px] text-muted-foreground">
                {currencySymbol}{totalSpent.toLocaleString()} of {currencySymbol}{totalBudget.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Remaining */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="col-span-2"
      >
        <Card className={`${cardBase} h-full ${remaining >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          <CardContent className="p-3 h-full flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${remaining >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <PiggyBank className={`h-5 w-5 ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{remaining >= 0 ? 'Remaining' : 'Over'}</p>
              <p className={`text-lg font-bold truncate ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currencySymbol}{Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Expenses Count */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="col-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-3 h-full flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold">{expenses.length}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Avg */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="col-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-3 h-full flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Daily Avg</p>
              <p className="text-lg font-bold truncate">{currencySymbol}{Math.round(dailyAvgSpent).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Pie - 2x2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="col-span-2 row-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-4 h-full flex flex-col">
            <p className="text-xs font-medium text-muted-foreground mb-2">Categories</p>
            {categoryData.length > 0 ? (
              <div className="flex-1 flex items-center gap-3">
                <ResponsiveContainer width={80} height={80}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={20} outerRadius={38} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 min-w-0">
                  {categoryData.slice(0, 3).map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] truncate flex-1">{cat.icon}</span>
                      <span className="text-[10px] font-medium">{currencySymbol}{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Spending Trend Sparkline - 4x1 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="col-span-4"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-3 h-full flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-[10px] text-muted-foreground">Trend</p>
              <p className="text-sm font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                {currencySymbol}{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 h-full">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#sparkGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Categories Bar - 2x2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="col-span-2 row-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-4 h-full flex flex-col">
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Spending</p>
            {categoryData.length > 0 ? (
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 4)} layout="vertical" margin={{ left: 0, right: 0 }}>
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {categoryData.slice(0, 4).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Expense */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="col-span-2"
      >
        <Card className={`${cardBase} h-full bg-gradient-to-br from-orange-500/10 to-orange-500/5`}>
          <CardContent className="p-3 h-full flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Biggest</p>
              {topExpense ? (
                <p className="text-lg font-bold truncate text-orange-600">{currencySymbol}{topExpense.amount.toLocaleString()}</p>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Budget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="col-span-2"
      >
        <Card className={`${cardBase} h-full`}>
          <CardContent className="p-3 h-full flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Daily Budget</p>
              <p className="text-lg font-bold truncate">{currencySymbol}{Math.round(dailyBudget).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
