import { useState, useCallback } from 'react';
import { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseCategory } from '@/types';
import { mockExpenses, getTripExpenses } from '@/data/mockData';

export function useExpenses(tripId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>(
    tripId ? getTripExpenses(tripId) : mockExpenses
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (tid?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const targetId = tid || tripId;
      setExpenses(targetId ? getTripExpenses(targetId) : mockExpenses);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const createExpense = useCallback(async (input: CreateExpenseInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newExpense: Expense = {
        id: Date.now().toString(),
        tripId: input.tripId,
        category: input.category,
        amount: input.amount,
        originalAmount: input.amount,
        originalCurrency: input.currency,
        convertedAmount: input.amount, // In production, convert currency
        currency: input.currency,
        date: input.date,
        description: input.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      setError('Failed to create expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExpense = useCallback(async (input: UpdateExpenseInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === input.id
            ? { ...expense, ...input, updatedAt: new Date().toISOString() }
            : expense
        )
      );
    } catch (err) {
      setError('Failed to update expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err) {
      setError('Failed to delete expense');
      throw err;
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
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);

  const getTotalSpent = useCallback(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
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
