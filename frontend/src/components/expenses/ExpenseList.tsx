import { Expense, ExpenseCategory } from '@/types';
import { expenseCategories, getCurrencySymbol } from '@/data/countries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const getCategoryInfo = (category: ExpenseCategory) => {
    return expenseCategories.find((c) => c.value === category);
  };

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
            const currencySymbol = getCurrencySymbol(expense.currency);

            return (
              <TableRow key={expense.id} className="group">
                <TableCell>
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
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {expense.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div>
                    {currencySymbol}
                    {expense.amount.toLocaleString()}
                  </div>
                  {expense.originalCurrency !== expense.currency && (
                    <div className="text-xs text-muted-foreground">
                      ({getCurrencySymbol(expense.originalCurrency)}
                      {expense.originalAmount.toLocaleString()})
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(expense)}
                      className="h-8 w-8"
                    >
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add pagination for large expense lists
 * - Add sorting by date, amount, category
 * - Add search/filter functionality
 * - Add batch select and delete
 * - Export as CSV/PDF
 */
