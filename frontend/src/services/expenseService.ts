import { api } from '@/lib/axios';
import { Expense } from '@/types';

export interface CreateExpenseRequest {
  tripId: number;
  description: string;
  amount: number;
  currency: string;
  category: 'accommodation' | 'food' | 'transportation' | 'activities' | 'shopping' | 'other';
  expenseDate: string;
  notes?: string;
}

export const expenseService = {
  /**
   * Get all expenses for a trip
   */
  async getExpensesByTrip(tripId: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>(`/expenses/trip/${tripId}`);
    return response.data;
  },

  /**
   * Create a new expense
   */
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: string): Promise<void> {
    await api.delete(`/expenses/${expenseId}`);
  },
};
