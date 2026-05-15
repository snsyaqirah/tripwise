import { api } from '@/lib/axios';

export interface PackingItem {
  id: string;
  tripId: string;
  label: string;
  category?: string;
  isChecked: boolean;
  createdAt: string;
  updatedAt: string;
}

export const packingService = {
  async getItems(tripId: string): Promise<PackingItem[]> {
    const res = await api.get<PackingItem[]>(`/trips/${tripId}/packing`);
    return res.data;
  },

  async addItem(tripId: string, label: string, category?: string): Promise<PackingItem> {
    const res = await api.post<PackingItem>(`/trips/${tripId}/packing`, { label, category });
    return res.data;
  },

  async toggleItem(tripId: string, itemId: string): Promise<PackingItem> {
    const res = await api.patch<PackingItem>(`/trips/${tripId}/packing/${itemId}/toggle`);
    return res.data;
  },

  async deleteItem(tripId: string, itemId: string): Promise<void> {
    await api.delete(`/trips/${tripId}/packing/${itemId}`);
  },

  async addPreset(tripId: string, type: string): Promise<PackingItem[]> {
    const res = await api.post<PackingItem[]>(`/trips/${tripId}/packing/preset?type=${type}`);
    return res.data;
  },
};
