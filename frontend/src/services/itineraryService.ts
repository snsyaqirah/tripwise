import { api } from '@/lib/axios';

export interface ItineraryItem {
  id: string;
  tripId: string;
  itemDate: string;
  startTime?: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItineraryItemRequest {
  itemDate: string;
  title: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  category?: string;
}

export const itineraryService = {
  async getItems(tripId: string): Promise<ItineraryItem[]> {
    const res = await api.get<ItineraryItem[]>(`/trips/${tripId}/itinerary`);
    return res.data;
  },

  async addItem(tripId: string, data: CreateItineraryItemRequest): Promise<ItineraryItem> {
    const res = await api.post<ItineraryItem>(`/trips/${tripId}/itinerary`, data);
    return res.data;
  },

  async updateItem(tripId: string, itemId: string, data: CreateItineraryItemRequest): Promise<ItineraryItem> {
    const res = await api.put<ItineraryItem>(`/trips/${tripId}/itinerary/${itemId}`, data);
    return res.data;
  },

  async deleteItem(tripId: string, itemId: string): Promise<void> {
    await api.delete(`/trips/${tripId}/itinerary/${itemId}`);
  },
};
