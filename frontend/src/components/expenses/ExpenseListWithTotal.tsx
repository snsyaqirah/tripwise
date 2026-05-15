import { useState } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseListWithTotalProps {
  expenses: Expense[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export function ExpenseListWithTotal({ expenses, currency, onEdit, onDelete }: ExpenseListWithTotalProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getCategoryInfo = (category: ExpenseCategory) => {
    return expenseCategories.find((c) => c.value === category);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const currencySymbol = getCurrencySymbol(currency);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses recorded yet.</p>
        <p className="text-sm mt-1">Add your first expense to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category);
            const expenseCurrencySymbol = getCurrencySymbol(expense.currency);

            return (
              <>
                <TableRow key={expense.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {expense.category === 'bundle' && expense.subItems && expense.subItems.length > 0 && (
                        <button
                          onClick={() => toggleExpand(expense.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {expandedIds.has(expense.id)
                            ? <ChevronDown className="h-3 w-3" />
                            : <ChevronRight className="h-3 w-3" />}
                        </button>
                      )}
                      <Badge
                        variant="secondary"
                        className="font-normal"
                        style={{
                          backgroundColor: `${categoryInfo?.color}15`,
                          color: categoryInfo?.color,
                        }}
                      >
                        {categoryInfo?.icon} {categoryInfo?.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expenseCurrencySymbol}{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(expense.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expense.category === 'bundle' && expandedIds.has(expense.id) && expense.subItems?.map((item, idx) => {
                  const subCatInfo = expenseCategories.find(c => c.value === item.category);
                  return (
                    <TableRow key={`${expense.id}-sub-${idx}`} className="bg-muted/20">
                      <TableCell className="pl-8">
                        {subCatInfo && (
                          <span className="text-xs text-muted-foreground">{subCatInfo.icon} {subCatInfo.label}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground pl-2">{item.description}</TableCell>
                      <TableCell />
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {expenseCurrencySymbol}{Number(item.amount).toLocaleString()}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  );
                })}
              </>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/80 font-semibold">
            <TableCell colSpan={3}>
              Total ({expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'})
            </TableCell>
            <TableCell className="text-right text-lg">
              {currencySymbol}{totalAmount.toLocaleString()}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
