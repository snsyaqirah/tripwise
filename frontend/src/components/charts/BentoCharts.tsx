import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Expense } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Receipt, Target, Crown, Scale } from 'lucide-react';

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
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const avgPerExpense = expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;
  const tripDuration = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  const dailyBudgetTarget = Math.round(totalBudget / tripDuration);

  // Category breakdown
  const categoryData = useMemo(() => {
    const totals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return expenseCategories
      .map((cat) => ({
        name: cat.label,
        shortName: cat.label.slice(0, 8),
        value: totals[cat.value] || 0,
        color: cat.color,
        icon: cat.icon,
      }))
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Top category
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Daily spending with cumulative
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
      return { 
        date: format(day, 'd'), 
        daily: dayTotal, 
        cumulative,
      };
    });
  }, [expenses, startDate, endDate]);

  // Budget gauge data
  const gaugeData = [{ value: Math.min(percentSpent, 100), fill: percentSpent > 90 ? 'hsl(0 84% 60%)' : percentSpent > 70 ? 'hsl(39 92% 67%)' : 'hsl(var(--primary))' }];

  return (
    <div className="space-y-4">
      {/* Top Row - 4 Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Biggest Category */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(178,100%,18%)]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">Top Category</p>
                  {topCategory ? (
                    <>
                      <p className="text-2xl font-bold text-white mt-1">{currencySymbol}{topCategory.value.toLocaleString()}</p>
                      <p className="text-xs text-white/60 mt-0.5">{topCategory.icon} {topCategory.name}</p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-white mt-1">—</p>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spent */}
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

        {/* Daily Budget Target */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">Daily Target</p>
                  <p className="text-2xl font-bold text-white mt-1">{currencySymbol}{dailyBudgetTarget.toLocaleString()}/day</p>
                  <p className="text-[10px] text-white/60">{tripDuration} days trip</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg per Expense */}
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

      {/* Bento Grid - Charts (2 per row) */}
      <div className="grid gap-3 grid-cols-2 auto-rows-[180px]">
        {/* Budget Gauge */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">Budget Usage</p>
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <ResponsiveContainer width={120} height={120}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pt-5">
                    <span className="text-3xl font-bold">{percentSpent}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground -mt-2">
                {currencySymbol}{totalSpent.toLocaleString()} / {currencySymbol}{totalBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <p className="text-xs font-semibold mb-2">By Category</p>
              {categoryData.length > 0 ? (
                <div className="flex-1 flex items-center gap-3">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value" strokeWidth={0}>
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

        {/* Spending Trend */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">Spending Trend</p>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/30" />Daily</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-1 bg-primary rounded" />Total</span>
                </div>
              </div>
              {dailyData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ fontSize: 11, borderRadius: 8 }} 
                        formatter={(value: number, name: string) => [`${currencySymbol}${value.toLocaleString()}`, name === 'daily' ? 'Daily' : 'Cumulative']}
                      />
                      <Bar dataKey="daily" fill="hsl(var(--primary))" opacity={0.3} radius={[2, 2, 0, 0]} />
                      <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#trendGrad)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Spending */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <p className="text-xs font-semibold mb-2">Top Spending</p>
              {categoryData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        type="category" 
                        dataKey="icon" 
                        tick={{ fontSize: 14 }} 
                        tickLine={false} 
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Spent']}
                        labelFormatter={(label) => categoryData.find(c => c.icon === label)?.name || label}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
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

        {/* Budget vs Expenses */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">Budget vs Expenses</p>
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Budget', value: totalBudget, fill: 'hsl(var(--muted-foreground))' },
                      { name: 'Spent', value: totalSpent, fill: 'hsl(var(--primary))' },
                    ]} 
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                      {[
                        { name: 'Budget', value: totalBudget, fill: 'hsl(var(--muted-foreground)/0.3)' },
                        { name: 'Spent', value: totalSpent, fill: 'hsl(var(--primary))' },
                      ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trip Summary Stats */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
          <Card className="h-full bg-gradient-to-br from-muted/50 to-muted">
            <CardContent className="p-4 h-full flex flex-col justify-center gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold">{expenses.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Categories Used</p>
                  <p className="text-xl font-bold">{categoryData.length}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Avg per Day</p>
                  <p className="text-lg font-semibold">{currencySymbol}{Math.round(totalSpent / tripDuration).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Avg per Expense</p>
                  <p className="text-lg font-semibold">{currencySymbol}{avgPerExpense.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
