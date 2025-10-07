import apiClient from './client';
import { Enrollment } from '../types';

interface EnrollmentListResponse {
  items: Enrollment[];
  total: number;
}

interface EnrollmentUpdate {
  status?: string;
  payment_status?: string;
  payment_amount?: number;
  notes?: string;
}

export const enrollmentsAPI = {
  listByEvent: async (eventId: number): Promise<EnrollmentListResponse> => {
    const response = await apiClient.get(`/enrollments/by-event/${eventId}`);
    return response.data;
  },

  listByParticipant: async (participantId: number): Promise<EnrollmentListResponse> => {
    const response = await apiClient.get(`/enrollments/by-participant/${participantId}`);
    return response.data;
  },

  create: async (eventId: number, participantId: number): Promise<Enrollment> => {
    const response = await apiClient.post('/enrollments/', {
      event_id: eventId,
      participant_id: participantId,
      status: 'confirmed',
      payment_status: 'unpaid',
    });
    return response.data;
  },

  update: async (enrollmentId: number, data: EnrollmentUpdate): Promise<Enrollment> => {
    const response = await apiClient.put(`/enrollments/${enrollmentId}`, data);
    return response.data;
  },

  delete: async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  },
};
