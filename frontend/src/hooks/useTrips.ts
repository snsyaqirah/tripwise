import { useState, useCallback } from 'react';
import { Trip, CreateTripInput, UpdateTripInput } from '@/types';
import { mockTrips } from '@/data/mockData';

// Custom hook for trip management
// In production, replace with actual API calls using the axios instance

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTrips(mockTrips);
    } catch (err) {
      setError('Failed to fetch trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (input: CreateTripInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newTrip: Trip = {
        id: Date.now().toString(),
        userId: '1',
        ...input,
        season: input.season ?? null,
        spentAmount: 0,
        remainingBudget: input.totalBudget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTrips((prev) => [...prev, newTrip]);
      return newTrip;
    } catch (err) {
      setError('Failed to create trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (input: UpdateTripInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === input.id
            ? { ...trip, ...input, updatedAt: new Date().toISOString() }
            : trip
        )
      );
    } catch (err) {
      setError('Failed to update trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      setError('Failed to delete trip');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTripById = useCallback(
    (id: string) => {
      return trips.find((trip) => trip.id === id);
    },
    [trips]
  );

  return {
    trips,
    isLoading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
  };
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add pagination support
 * - Add sorting and filtering
 * - Add optimistic updates
 * - Add retry logic for failed requests
 * - Export trips as CSV/PDF
 * - Add offline support with local storage sync
 */
