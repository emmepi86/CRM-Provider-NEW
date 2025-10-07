import apiClient from './client';
import { Speaker, SpeakerCreate, SpeakerUpdate, SpeakersListResponse, EventSpeaker, EventSpeakerCreate } from '../types/speaker';

export const speakersAPI = {
  // CRUD Speakers
  list: async (params?: {
    search?: string;
    specialization?: string;
    page?: number;
    page_size?: number;
  }): Promise<SpeakersListResponse> => {
    const response = await apiClient.get('/speakers/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Speaker> => {
    const response = await apiClient.get(`/speakers/${id}`);
    return response.data;
  },

  create: async (data: SpeakerCreate): Promise<Speaker> => {
    const response = await apiClient.post('/speakers/', data);
    return response.data;
  },

  update: async (id: number, data: SpeakerUpdate): Promise<Speaker> => {
    const response = await apiClient.put(`/speakers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/speakers/${id}`);
  },

  // Event-Speaker Association
  addToEvent: async (eventId: number, data: EventSpeakerCreate): Promise<EventSpeaker> => {
    const response = await apiClient.post(`/speakers/events/${eventId}/speakers`, data);
    return response.data;
  },

  listByEvent: async (eventId: number): Promise<{ event_id: number; speakers: EventSpeaker[] }> => {
    const response = await apiClient.get(`/speakers/events/${eventId}/speakers`);
    return response.data;
  },

  updateEventSpeaker: async (eventId: number, speakerId: number, data: Partial<EventSpeaker>): Promise<EventSpeaker> => {
    const response = await apiClient.put(`/speakers/events/${eventId}/speakers/${speakerId}`, data);
    return response.data;
  },


  removeFromEvent: async (eventId: number, speakerId: number): Promise<void> => {
    await apiClient.delete(`/speakers/events/${eventId}/speakers/${speakerId}`);
  },

  // Speaker Events
  listSpeakerEvents: async (speakerId: number): Promise<{
    speaker_id: number;
    events: Array<{
      id: number;
      event_id: number;
      role: string;
      session_title?: string;
      session_datetime?: string;
      honorarium?: number;
      travel_booked: boolean;
      accommodation_booked: boolean;
      notes?: string;
      event: {
        id: number;
        title: string;
        start_date: string;
        end_date: string;
        location?: string;
        event_type: string;
        status: string;
      };
    }>;
  }> => {
    const response = await apiClient.get(`/speakers/${speakerId}/events`);
    return response.data;
  },
};
