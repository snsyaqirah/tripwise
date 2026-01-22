import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTrips } from '@/hooks/useTrips';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, CreateExpenseInput } from '@/types';
import { getCountryByCode, getCurrencySymbol, expenseCategories } from '@/data/countries';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  Wallet,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTripById } = useTrips();
  const {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    getTotalByCategory,
    getTotalSpent,
  } = useExpenses(tripId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const trip = tripId ? getTripById(tripId) : undefined;

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold mb-2">Trip not found</h2>
        <p className="text-muted-foreground mb-4">
          The trip you're looking for doesn't exist.
        </p>
        <Link to="/trips">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trips
          </Button>
        </Link>
      </div>
    );
  }

  const country = getCountryByCode(trip.destinationCountry);
  const currencySymbol = getCurrencySymbol(trip.favoriteCurrency);
  const totalSpent = getTotalSpent();
  const remaining = trip.totalBudget - totalSpent;
  const spentPercentage = (totalSpent / trip.totalBudget) * 100;
  const categoryTotals = getTotalByCategory();

  const handleCreateExpense = async (data: CreateExpenseInput) => {
    try {
      await createExpense(data);
      toast({
        title: 'Expense added!',
        description: 'Your expense has been recorded.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add expense',
        description: 'Something went wrong. Please try again.',
      });
      throw error;
    }
  };

  const handleUpdateExpense = async (data: CreateExpenseInput) => {
    if (!editingExpense) return;
    try {
      await updateExpense({ ...data, id: editingExpense.id });
      toast({
        title: 'Expense updated!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update expense',
        description: 'Something went wrong. Please try again.',
      });
      throw error;
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete);
      toast({
        title: 'Expense deleted',
        description: 'The expense has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete expense',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/trips"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trips
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {country?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.startDate), 'MMM d')} -{' '}
                {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {trip.totalBudget.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {currencySymbol}
                {totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {spentPercentage.toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  remaining < 0 ? 'text-destructive' : 'text-success'
                }`}
              >
                {currencySymbol}
                {remaining.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress
                value={Math.min(spentPercentage, 100)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenseCategories.map((cat) => {
                  const amount = categoryTotals[cat.value as keyof typeof categoryTotals] || 0;
                  if (amount === 0) return null;
                  const percentage = (amount / totalSpent) * 100;

                  return (
                    <div
                      key={cat.value}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{cat.label}</span>
                          <span className="font-semibold">
                            {currencySymbol}
                            {amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Expenses</CardTitle>
            {expenses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Form */}
      <ExpenseForm
        open={formOpen}
        onOpenChange={handleFormClose}
        tripId={tripId!}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        expense={editingExpense}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/*
 * BONUS / UPGRADE NOTES:
 * - Carbon footprint tracking placeholder
 * - Destination notes / local advice section
 * - Budget alerts when exceeding category limits
 * - Share trip with other travelers
 * - Export trip report as PDF
 */
