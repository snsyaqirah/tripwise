import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Expense, ExpenseCategory } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import { AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BudgetAlertsProps {
  expenses: Expense[];
  totalBudget: number;
  currency: string;
  categoryBudgets?: Record<ExpenseCategory, number>;
  onDismiss?: (alertId: string) => void;
  dismissedAlerts?: string[];
}

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  category?: ExpenseCategory;
  title: string;
  message: string;
  percentage?: number;
}

export function BudgetAlerts({
  expenses,
  totalBudget,
  currency,
  categoryBudgets,
  onDismiss,
  dismissedAlerts = [],
}: BudgetAlertsProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const alerts = useMemo(() => {
    const alertList: BudgetAlert[] = [];

    // Overall budget alerts
    const spentPercentage = (totalSpent / totalBudget) * 100;

    if (spentPercentage >= 100) {
      alertList.push({
        id: 'budget-exceeded',
        type: 'danger',
        title: '🚨 Budget Exceeded!',
        message: `You've exceeded your total budget by ${currencySymbol}${(totalSpent - totalBudget).toLocaleString()}. Consider reviewing your expenses.`,
        percentage: spentPercentage,
      });
    } else if (spentPercentage >= 90) {
      alertList.push({
        id: 'budget-critical',
        type: 'danger',
        title: '⚠️ Budget Nearly Exhausted',
        message: `You've used ${spentPercentage.toFixed(1)}% of your budget. Only ${currencySymbol}${(totalBudget - totalSpent).toLocaleString()} remaining.`,
        percentage: spentPercentage,
      });
    } else if (spentPercentage >= 75) {
      alertList.push({
        id: 'budget-warning',
        type: 'warning',
        title: '💡 Budget Alert',
        message: `You've used ${spentPercentage.toFixed(1)}% of your budget. ${currencySymbol}${(totalBudget - totalSpent).toLocaleString()} remaining.`,
        percentage: spentPercentage,
      });
    }

    // Category-specific alerts
    if (categoryBudgets) {
      const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(categoryBudgets).forEach(([category, budget]) => {
        const spent = categoryTotals[category] || 0;
        const catPercentage = (spent / budget) * 100;
        const catInfo = expenseCategories.find((c) => c.value === category);

        if (catPercentage >= 100) {
          alertList.push({
            id: `cat-exceeded-${category}`,
            type: 'danger',
            category: category as ExpenseCategory,
            title: `${catInfo?.icon} ${catInfo?.label} Budget Exceeded`,
            message: `You've exceeded your ${catInfo?.label.toLowerCase()} budget by ${currencySymbol}${(spent - budget).toLocaleString()}.`,
            percentage: catPercentage,
          });
        } else if (catPercentage >= 80) {
          alertList.push({
            id: `cat-warning-${category}`,
            type: 'warning',
            category: category as ExpenseCategory,
            title: `${catInfo?.icon} ${catInfo?.label} Budget Warning`,
            message: `You've used ${catPercentage.toFixed(0)}% of your ${catInfo?.label.toLowerCase()} budget.`,
            percentage: catPercentage,
          });
        }
      });
    } else {
      // If no category budgets, check for disproportionate spending
      const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(categoryTotals).forEach(([category, spent]) => {
        const catInfo = expenseCategories.find((c) => c.value === category);
        const categoryPercentage = (spent / totalSpent) * 100;

        // Alert if single category takes more than 50% of total spending
        if (categoryPercentage >= 50 && totalSpent > 0) {
          alertList.push({
            id: `cat-high-${category}`,
            type: 'info',
            category: category as ExpenseCategory,
            title: `${catInfo?.icon} High ${catInfo?.label} Spending`,
            message: `${catInfo?.label} accounts for ${categoryPercentage.toFixed(0)}% of your total spending (${currencySymbol}${spent.toLocaleString()}).`,
            percentage: categoryPercentage,
          });
        }
      });
    }

    // Filter out dismissed alerts
    return alertList.filter((alert) => !dismissedAlerts.includes(alert.id));
  }, [expenses, totalBudget, totalSpent, currency, categoryBudgets, dismissedAlerts, currencySymbol]);

  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAlertClass = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'danger':
        return 'border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive';
      case 'warning':
        return 'border-accent/50 bg-accent/10 text-accent-foreground [&>svg]:text-accent';
      default:
        return 'border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary';
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert className={getAlertClass(alert.type)}>
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
                <AlertDescription className="mt-1">
                  {alert.message}
                </AlertDescription>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-2 right-2"
                  onClick={() => onDismiss(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
