import { api } from '@/lib/axios';
import { Expense } from '@/types';

export interface CreateSubItemRequest {
  description: string;
  amount: number;
  category?: string;
}

export interface CreateExpenseRequest {
  tripId: number;
  description: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: string;
  notes?: string;
  subItems?: CreateSubItemRequest[];
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
