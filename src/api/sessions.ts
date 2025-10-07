import apiClient from './client';
import { EventSession, SessionCreate, ProgramGeneratorRequest, AttendanceRecord } from '../types';

interface SessionListResponse {
  sessions: EventSession[];
  total: number;
}

interface AttendanceListResponse {
  records: AttendanceRecord[];
}

export const sessionsAPI = {
  // List sessions for an event
  listByEvent: async (eventId: number): Promise<SessionListResponse> => {
    const response = await apiClient.get(`/events/${eventId}/sessions/`);
    return response.data;
  },

  // Get single session
  getById: async (eventId: number, sessionId: number): Promise<EventSession> => {
    const response = await apiClient.get(`/events/${eventId}/sessions/${sessionId}`);
    return response.data;
  },

  // Create session
  create: async (data: SessionCreate): Promise<EventSession> => {
    const response = await apiClient.post(`/events/${data.event_id}/sessions/`, data);
    return response.data;
  },

  // Update session
  update: async (eventId: number, sessionId: number, data: Partial<SessionCreate>): Promise<EventSession> => {
    const response = await apiClient.put(`/events/${eventId}/sessions/${sessionId}`, data);
    return response.data;
  },

  // Delete session
  delete: async (eventId: number, sessionId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/sessions/${sessionId}`);
  },

  // Generate conference program
  generateProgram: async (data: ProgramGeneratorRequest): Promise<SessionListResponse> => {
    const response = await apiClient.post(`/events/${data.event_id}/sessions/generate-program`, data);
    return response.data;
  },

  // Get session statistics
  getStats: async (eventId: number, sessionId: number): Promise<any> => {
    const response = await apiClient.get(`/events/${eventId}/sessions/${sessionId}/stats`);
    return response.data;
  },

  // Attendance tracking
  checkIn: async (sessionId: number, enrollmentId: number): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/attendance/check-in', {
      session_id: sessionId,
      enrollment_id: enrollmentId,
    });
    return response.data;
  },

  checkOut: async (attendanceId: number): Promise<AttendanceRecord> => {
    const response = await apiClient.post(`/attendance/${attendanceId}/check-out`);
    return response.data;
  },

  getAttendance: async (sessionId: number): Promise<AttendanceListResponse> => {
    const response = await apiClient.get(`/attendance/session/${sessionId}`);
    return response.data;
  },
};
