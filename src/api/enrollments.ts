import apiClient from './client';
import { Enrollment, Participant } from '../types';

interface EnrollmentListResponse {
  items: Enrollment[];
  total: number;
}

export const enrollmentsAPI = {
  listByEvent: async (eventId: number): Promise<EnrollmentListResponse> => {
    const response = await apiClient.get(`/enrollments/by-event/${eventId}`);
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

  delete: async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  },
};
