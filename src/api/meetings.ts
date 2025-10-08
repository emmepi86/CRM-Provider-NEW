import apiClient from './client';

export interface Meeting {
  id: number;
  tenant_id: number;
  event_id: number;
  title: string;
  room_name: string;
  meeting_url: string;
  description: string | null;
  scheduled_at: string | null;
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
  description?: string;
  scheduled_at?: string;
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
  create: async (eventId: number, data: Omit<MeetingCreate, 'event_id'>): Promise<Meeting> => {
    const response = await apiClient.post(`/events/${eventId}/meeting`, {
      ...data,
      event_id: eventId,
    });
    return response.data;
  },

  /**
   * Get meeting for an event (legacy - returns first meeting)
   */
  getByEvent: async (eventId: number): Promise<Meeting> => {
    const response = await apiClient.get(`/events/${eventId}/meeting`);
    return response.data;
  },

  /**
   * Get list of active/scheduled meetings for an event
   */
  getMeetingsList: async (eventId: number): Promise<Meeting[]> => {
    const response = await apiClient.get(`/events/${eventId}/meetings`);
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
   * Delete meeting (legacy - deletes first meeting)
   */
  delete: async (eventId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/meeting`);
  },

  /**
   * Delete a specific meeting by ID
   */
  deleteById: async (meetingId: number): Promise<void> => {
    await apiClient.delete(`/meetings/${meetingId}`);
  },

  /**
   * Update meeting title
   */
  updateTitle: async (eventId: number, title: string): Promise<Meeting> => {
    const response = await apiClient.patch(`/events/${eventId}/meeting/title`, { title });
    return response.data;
  },

  /**
   * Get all recordings for an event
   */
  getRecordings: async (eventId: number): Promise<Meeting[]> => {
    const response = await apiClient.get(`/events/${eventId}/meetings/recordings`);
    return response.data;
  },

  /**
   * Get JWT token for joining a meeting (legacy - returns token for first meeting)
   */
  getJoinToken: async (eventId: number): Promise<JoinTokenResponse> => {
    const response = await apiClient.get(`/events/${eventId}/meeting/join-token`);
    return response.data;
  },

  /**
   * Get JWT token for joining a specific meeting by ID
   */
  getJoinTokenById: async (meetingId: number): Promise<JoinTokenResponse> => {
    const response = await apiClient.get(`/meetings/${meetingId}/join-token`);
    return response.data;
  },
};
