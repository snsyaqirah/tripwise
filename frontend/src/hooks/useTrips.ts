import { useState, useCallback, useEffect } from 'react';
import { Trip } from '@/types';
import { tripService, CreateTripRequest, UpdateTripRequest } from '@/services/tripService';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripService.getAllTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trips');
      console.error('Fetch trips error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback(async (input: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Map CreateTripInput to CreateTripRequest for backend
      const requestData: CreateTripRequest = {
        name: input.name,
        destinationCountry: input.destinationCountry,
        startDate: input.startDate,
        endDate: input.endDate,
        budget: input.totalBudget || input.budget,
        currency: input.favoriteCurrency || input.currency,
        budgetType: input.budgetType || 'solo',
        description: input.description,
        image: input.image,
        notes: input.notes,
        status: input.status || 'PLANNED',
      };
      
      console.log('Creating trip with data:', requestData);
      const newTrip = await tripService.createTrip(requestData);
      console.log('Trip created successfully:', newTrip);
      setTrips((prev) => [...prev, newTrip]);
      return newTrip;
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Failed to create trip';
      
      // Special handling for "User not found" error
      if (errorMsg.includes('User not found')) {
        errorMsg = 'Your session is outdated. Please log out and log in again to continue.';
      }
      
      setError(errorMsg);
      console.error('Create trip error:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (input: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Map update input to backend request
      const requestData: UpdateTripRequest = {
        name: input.name,
        destinationCountry: input.destinationCountry,
        startDate: input.startDate,
        endDate: input.endDate,
        budget: input.totalBudget || input.budget,
        currency: input.favoriteCurrency || input.currency,
        budgetType: input.budgetType,
        description: input.description,
        image: input.image,
        notes: input.notes,
        status: input.status,
        isArchived: input.isArchived,
      };
      
      const updatedTrip = await tripService.updateTrip(input.id, requestData);
      setTrips((prev) =>
        prev.map((trip) => (String(trip.id) === String(input.id) ? updatedTrip : trip))
      );
      return updatedTrip;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update trip';
      setError(errorMsg);
      console.error('Update trip error:', err);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await tripService.deleteTrip(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete trip';
      setError(errorMsg);
      console.error('Delete trip error:', err);
      throw new Error(errorMsg);
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
