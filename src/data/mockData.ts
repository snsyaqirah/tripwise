import { Trip, Expense, User } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Traveler',
  email: 'alex@tripwise.com',
  avatar: undefined,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockTrips: Trip[] = [
  {
    id: '1',
    userId: '1',
    name: 'Summer in Tokyo',
    destinationCountry: 'JP',
    startDate: '2024-07-15',
    endDate: '2024-07-28',
    totalBudget: 5000,
    spentAmount: 3250,
    remainingBudget: 1750,
    season: 'summer',
    favoriteCurrency: 'USD',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    name: 'Paris Getaway',
    destinationCountry: 'FR',
    startDate: '2024-09-10',
    endDate: '2024-09-17',
    totalBudget: 3500,
    spentAmount: 0,
    remainingBudget: 3500,
    season: 'autumn',
    favoriteCurrency: 'EUR',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: '3',
    userId: '1',
    name: 'Thailand Adventure',
    destinationCountry: 'TH',
    startDate: '2024-12-20',
    endDate: '2025-01-05',
    totalBudget: 4000,
    spentAmount: 500,
    remainingBudget: 3500,
    season: null,
    favoriteCurrency: 'USD',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    tripId: '1',
    category: 'accommodation',
    amount: 1200,
    originalAmount: 180000,
    originalCurrency: 'JPY',
    convertedAmount: 1200,
    currency: 'USD',
    date: '2024-07-15',
    description: 'Shinjuku Hotel - 7 nights',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z',
  },
  {
    id: '2',
    tripId: '1',
    category: 'transportation',
    amount: 450,
    originalAmount: 67500,
    originalCurrency: 'JPY',
    convertedAmount: 450,
    currency: 'USD',
    date: '2024-07-15',
    description: 'JR Pass 7-day',
    createdAt: '2024-07-15T12:00:00Z',
    updatedAt: '2024-07-15T12:00:00Z',
  },
  {
    id: '3',
    tripId: '1',
    category: 'food',
    amount: 350,
    originalAmount: 52500,
    originalCurrency: 'JPY',
    convertedAmount: 350,
    currency: 'USD',
    date: '2024-07-16',
    description: 'Various restaurants and cafes',
    createdAt: '2024-07-16T20:00:00Z',
    updatedAt: '2024-07-16T20:00:00Z',
  },
  {
    id: '4',
    tripId: '1',
    category: 'activities',
    amount: 500,
    originalAmount: 75000,
    originalCurrency: 'JPY',
    convertedAmount: 500,
    currency: 'USD',
    date: '2024-07-17',
    description: 'Mt. Fuji tour, TeamLab',
    createdAt: '2024-07-17T09:00:00Z',
    updatedAt: '2024-07-17T09:00:00Z',
  },
  {
    id: '5',
    tripId: '1',
    category: 'shopping',
    amount: 550,
    originalAmount: 82500,
    originalCurrency: 'JPY',
    convertedAmount: 550,
    currency: 'USD',
    date: '2024-07-20',
    description: 'Electronics and souvenirs',
    createdAt: '2024-07-20T15:00:00Z',
    updatedAt: '2024-07-20T15:00:00Z',
  },
  {
    id: '6',
    tripId: '1',
    category: 'other',
    amount: 200,
    originalAmount: 30000,
    originalCurrency: 'JPY',
    convertedAmount: 200,
    currency: 'USD',
    date: '2024-07-21',
    description: 'Pocket WiFi, SIM card',
    createdAt: '2024-07-21T08:00:00Z',
    updatedAt: '2024-07-21T08:00:00Z',
  },
  {
    id: '7',
    tripId: '3',
    category: 'transportation',
    amount: 500,
    originalAmount: 500,
    originalCurrency: 'USD',
    convertedAmount: 500,
    currency: 'USD',
    date: '2024-12-20',
    description: 'Round trip flights',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

export function getTripExpenses(tripId: string): Expense[] {
  return mockExpenses.filter((e) => e.tripId === tripId);
}

export function calculateTripStats(tripId: string) {
  const expenses = getTripExpenses(tripId);
  const trip = mockTrips.find((t) => t.id === tripId);
  
  if (!trip) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalBudget: trip.totalBudget,
    totalSpent,
    remaining: trip.totalBudget - totalSpent,
    percentageSpent: (totalSpent / trip.totalBudget) * 100,
    categoryTotals,
  };
}
