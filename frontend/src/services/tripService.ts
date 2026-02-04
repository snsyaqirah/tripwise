import { api } from '@/lib/axios';
import { Trip } from '@/types';

export interface CreateTripRequest {
  name: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  budget: number;
  currency: string;
  budgetType?: string;
  notes?: string;
  status?: 'PLANNED' | 'ONGOING' | 'COMPLETED';
}

export interface UpdateTripRequest {
  name?: string;
  destinationCountry?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  image?: string;
  budget?: number;
  currency?: string;
  budgetType?: string;
  notes?: string;
  status?: 'PLANNED' | 'ONGOING' | 'COMPLETED';
  isArchived?: boolean;
}

export const tripService = {
  /**
   * Get all trips for the current user
   */
  async getAllTrips(): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips');
    return response.data;
  },

  /**
   * Get a single trip by ID
   */
  async getTripById(tripId: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${tripId}`);
    return response.data;
  },

  /**
   * Create a new trip
   */
  async createTrip(data: CreateTripRequest): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response.data;
  },

  /**
   * Update an existing trip
   */
  async updateTrip(tripId: string, data: UpdateTripRequest): Promise<Trip> {
    const response = await api.put<Trip>(`/trips/${tripId}`, data);
    return response.data;
  },

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },
};
