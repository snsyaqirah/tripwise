// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  country?: string;
  currency?: string;
  onboardingCompleted?: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Trip types
export interface Trip {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  name: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  budget: number;
  currency: string;
  budgetType: string;
  notes?: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members?: TripMember[];
  memberCount?: number;
  totalExpenses?: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CreateTripInput {
  name: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  budgetType?: 'solo' | 'shared' | 'separated';
  season?: Season | null;
  favoriteCurrency: string;
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'editor' | 'viewer';
  status: number;
  joinedAt: string;
}

export interface MemberBudget {
  id: string;
  tripId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  allocatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  status: number;
  createdAt: string;
  updatedAt: string;
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
  tripId: number;
  paidBy: string;
  paidByUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  expenseDate: string;
  notes?: string;
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
 / Destination Notes types
export interface DestinationNote {
  id: string;
  tripId: string;
  infoKey?: string;
  title?: string;
  content: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// Budget Alert types
export interface BudgetAlert {
  id: string;
  tripId: string;
  userId?: string;
  thresholdPercentage: number;
  triggered: boolean;
  triggeredAt?: string;
  status: number;
  createdAt: string;
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add CarbonFootprint type for environmental tracking
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add CarbonFootprint type for environmental tracking
 * - Add DestinationNotes type for local advice
 * - Add BudgetAlert type for category-specific alerts
 * - Add ExportOptions type for CSV/PDF export configuration
 */
