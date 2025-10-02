import apiClient from './client';
import { Event } from '../types';

interface EventListResponse {
  items: Event[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface EventFilters {
  event_type?: 'ecm' | 'non_ecm';
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  search?: string;
  page?: number;
  per_page?: number;
}

export const eventsAPI = {
  list: async (filters?: EventFilters): Promise<EventListResponse> => {
    const params = new URLSearchParams();
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('query', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('page_size', filters.per_page.toString());
    
    const response = await apiClient.get(`/events/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },
};
