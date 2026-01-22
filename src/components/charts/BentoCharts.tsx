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
import { TrendingUp, Wallet, PiggyBank, Receipt, Flame, Calendar, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  const avgPerExpense = expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;

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
  const gaugeData = [{ value: Math.min(percentSpent, 100), fill: percentSpent > 90 ? 'hsl(0 84% 60%)' : percentSpent > 70 ? 'hsl(39 92% 67%)' : 'hsl(var(--primary))' }];

  return (
    <div className="space-y-4">
      {/* Top Row - 4 Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(178,100%,18%)]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">Total Budget</p>
                  <p className="text-2xl font-bold text-white mt-1">{currencySymbol}{totalBudget.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(35,90%,55%)]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-black/60">Spent</p>
                  <p className="text-2xl font-bold text-black mt-1">{currencySymbol}{totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] text-black/50">{percentSpent}% used</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-black/70" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`border-0 ${remaining >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">{remaining >= 0 ? 'Remaining' : 'Over Budget'}</p>
                  <p className="text-2xl font-bold text-white mt-1">{currencySymbol}{Math.abs(remaining).toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  {remaining >= 0 ? <ArrowDownRight className="h-4 w-4 text-white" /> : <ArrowUpRight className="h-4 w-4 text-white" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Avg/Expense</p>
                  <p className="text-2xl font-bold mt-1">{currencySymbol}{avgPerExpense.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{expenses.length} recorded</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bento Grid - Various Charts */}
      <div className="grid gap-3 grid-cols-6 auto-rows-[100px]">
        {/* Budget Gauge - 2 cols, 2 rows */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="col-span-3 lg:col-span-2 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">Budget Usage</p>
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <ResponsiveContainer width={110} height={110}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pt-4">
                    <span className="text-2xl font-bold">{percentSpent}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Pie - 2 cols, 2 rows */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="col-span-3 lg:col-span-2 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <p className="text-xs font-semibold mb-2">By Category</p>
              {categoryData.length > 0 ? (
                <div className="flex-1 flex items-center gap-3">
                  <ResponsiveContainer width={90} height={90}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={22} outerRadius={40} paddingAngle={2} dataKey="value" strokeWidth={0}>
                        {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {categoryData.slice(0, 4).map((cat) => (
                      <div key={cat.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] truncate flex-1">{cat.icon}</span>
                        <span className="text-[10px] font-semibold">{currencySymbol}{cat.value.toLocaleString()}</span>
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

        {/* Spending Trend - 2 cols, 2 rows */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="col-span-3 lg:col-span-2 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">Spending Trend</p>
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              {dailyData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#trendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories Bar - 3 cols, 2 rows */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="col-span-3 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <p className="text-xs font-semibold mb-2">Top Spending</p>
              {categoryData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData.slice(0, 5)} layout="vertical" margin={{ left: -20, right: 10 }}>
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                        {categoryData.slice(0, 5).map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

        {/* Daily Stats - 3 small cards */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="col-span-3 lg:col-span-1">
          <Card className="h-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Biggest</p>
                <p className="text-sm font-bold truncate text-orange-600">{topExpense ? `${currencySymbol}${topExpense.amount.toLocaleString()}` : '—'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="col-span-3 lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Daily Avg</p>
                <p className="text-sm font-bold truncate">{currencySymbol}{Math.round(dailyAvgSpent).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="col-span-3 lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Daily Budget</p>
                <p className="text-sm font-bold truncate">{currencySymbol}{Math.round(dailyBudget).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
