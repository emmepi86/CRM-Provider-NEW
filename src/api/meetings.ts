import apiClient from './client';

export interface Meeting {
  id: number;
  tenant_id: number;
  event_id: number;
  title: string;
  room_name: string;
  meeting_url: string;
  status: 'scheduled' | 'active' | 'ended';
  started_at: string | null;
  ended_at: string | null;
  recording_path: string | null;
  recording_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingCreate {
  title: string;
  event_id: number;
}

export interface MeetingUpdate {
  status?: 'scheduled' | 'active' | 'ended';
  started_at?: string;
  ended_at?: string;
}

export interface JoinTokenResponse {
  token: string;
  room_name: string;
  meeting_url: string;
  is_moderator: boolean;
}

export const meetingsAPI = {
  /**
   * Create a new meeting for an event
   */
  create: async (eventId: number, title: string): Promise<Meeting> => {
    const response = await apiClient.post(`/events/${eventId}/meeting`, {
      title,
      event_id: eventId,
    });
    return response.data;
  },

  /**
   * Get meeting for an event
   */
  getByEvent: async (eventId: number): Promise<Meeting> => {
    const response = await apiClient.get(`/events/${eventId}/meeting`);
    return response.data;
  },

  /**
   * Update meeting status
   */
  updateStatus: async (eventId: number, data: MeetingUpdate): Promise<Meeting> => {
    const response = await apiClient.put(`/events/${eventId}/meeting/status`, data);
    return response.data;
  },

  /**
   * Delete meeting
   */
  delete: async (eventId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/meeting`);
  },

  /**
   * Get JWT token for joining a meeting
   */
  getJoinToken: async (eventId: number): Promise<JoinTokenResponse> => {
    const response = await apiClient.get(`/events/${eventId}/meeting/join-token`);
    return response.data;
  },
};
