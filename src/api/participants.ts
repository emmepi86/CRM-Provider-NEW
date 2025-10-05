import { apiClient } from './client';
import { Participant } from '../types';

interface ParticipantsListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Participant[];
}

interface ParticipantsListParams {
  search?: string;
  limit?: number;
  skip?: number;
}

export const participantsAPI = {
  list: async (params?: ParticipantsListParams): Promise<ParticipantsListResponse> => {
    const { data } = await apiClient.get<ParticipantsListResponse>('/participants', { params });
    return data;
  },

  get: async (id: number): Promise<Participant> => {
    const { data } = await apiClient.get<Participant>(`/participants/${id}`);
    return data;
  },

  create: async (participant: Partial<Participant>): Promise<Participant> => {
    const { data } = await apiClient.post<Participant>('/participants', participant);
    return data;
  },

  update: async (id: number, participant: Partial<Participant>): Promise<Participant> => {
    const { data } = await apiClient.put<Participant>(`/participants/${id}`, participant);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/participants/${id}`);
  },
};
