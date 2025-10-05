import apiClient from './client';

export interface ECMActivity {
  title: string;
  complete: boolean;
  timecompleted: number | null;
  criteria: string;
  requirement: string;
}

export interface ECMTracking {
  id: number;
  enrollment_id: number;
  participant_id: number;
  event_id: number;
  completed: boolean;
  completion_date: string | null;
  grade: number | null;
  certificate_url: string | null;
  moodle_synced_at: string | null;
  activities: ECMActivity[] | null;
}

export const ecmAPI = {
  getByEnrollment: async (enrollmentId: number): Promise<ECMTracking> => {
    const { data } = await apiClient.get<ECMTracking>(`/ecm/enrollment/${enrollmentId}`);
    return data;
  },
};
