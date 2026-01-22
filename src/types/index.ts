// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Trip types
export interface Trip {
  id: string;
  userId: string;
  name: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  season: Season | null;
  favoriteCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CreateTripInput {
  name: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  season?: Season | null;
  favoriteCurrency: string;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  id: string;
}

// Expense types
export type ExpenseCategory =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  currency: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
}

export interface UpdateExpenseInput extends Partial<Omit<CreateExpenseInput, 'tripId'>> {
  id: string;
}

// Dashboard types
export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageSpent: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardData {
  budgetOverview: BudgetOverview;
  categoryBreakdown: CategoryBreakdown[];
  recentExpenses: Expense[];
}

// Country data
export interface Country {
  code: string;
  name: string;
  hasSeason: boolean;
  currency: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add CarbonFootprint type for environmental tracking
 * - Add DestinationNotes type for local advice
 * - Add BudgetAlert type for category-specific alerts
 * - Add ExportOptions type for CSV/PDF export configuration
 */
