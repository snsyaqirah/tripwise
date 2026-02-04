import { useState, useCallback, useEffect } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { expenseService, CreateExpenseRequest } from '@/services/expenseService';

export function useExpenses(tripId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (tid?: string) => {
    const targetTripId = tid || tripId;
    if (!targetTripId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpensesByTrip(targetTripId);
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      console.error('Fetch expenses error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  // Auto-fetch when tripId changes
  useEffect(() => {
    if (tripId) {
      fetchExpenses();
    }
  }, [tripId, fetchExpenses]);

  const createExpense = useCallback(async (input: CreateExpenseRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newExpense = await expenseService.createExpense(input);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create expense';
      setError(errorMsg);
      console.error('Create expense error:', err);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete expense';
      setError(errorMsg);
      console.error('Delete expense error:', err);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtering and search
  const filterByCategory = useCallback(
    (category: ExpenseCategory) => {
      return expenses.filter((e) => e.category === category);
    },
    [expenses]
  );

  const searchExpenses = useCallback(
    (query: string) => {
      const lowered = query.toLowerCase();
      return expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(lowered) ||
          e.category.toLowerCase().includes(lowered)
      );
    },
    [expenses]
  );

  // Statistics
  const getTotalByCategory = useCallback(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);

  const getTotalSpent = useCallback(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    deleteExpense,
    filterByCategory,
    searchExpenses,
    getTotalByCategory,
    getTotalSpent,
  };
}

/*
 * BONUS / UPGRADE NOTES:
 * - Multi-currency conversion with real-time exchange rates
 * - Budget alerts when category exceeds threshold
 * - Receipt image upload and OCR
 * - Recurring expense patterns
 * - Export expenses as CSV/PDF
 * - Batch expense operations
 */
