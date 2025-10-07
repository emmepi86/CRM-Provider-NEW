import { apiClient } from './client';

export interface TriggerSyncResponse {
  message: string;
  task: string;
  task_id: string;
  tenant_id: number;
}

export interface TriggerSyncAllResponse {
  message: string;
  tasks: {
    courses: string;
    enrollments: string;
    ecm: string;
  };
  tenant_id: number;
}

export interface SyncLog {
  id: number;
  tenant_id: number;
  job_type: string;
  status: 'success' | 'failed' | 'partial' | 'running';
  records_processed: number;
  errors_count: number;
  error_details?: {
    errors?: string[];
    error?: string;
  };
  duration_seconds?: number;
  started_at: string;
  completed_at?: string;
}

export interface SyncLogsListResponse {
  total: number;
  page: number;
  page_size: number;
  items: SyncLog[];
}

export interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  partial_syncs: number;
  total_records_processed: number;
  total_errors: number;
  last_sync?: SyncLog;
  by_job_type: {
    [key: string]: {
      total: number;
      success: number;
      failed: number;
    };
  };
}

export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';
  result?: any;
  traceback?: string;
}

export const syncAPI = {
  // Trigger sync operations
  triggerSyncCourses: async (): Promise<TriggerSyncResponse> => {
    const { data } = await apiClient.post<TriggerSyncResponse>('/sync/moodle/courses');
    return data;
  },

  triggerSyncEnrollments: async (): Promise<TriggerSyncResponse> => {
    const { data } = await apiClient.post<TriggerSyncResponse>('/sync/moodle/enrollments');
    return data;
  },

  triggerSyncECM: async (): Promise<TriggerSyncResponse> => {
    const { data } = await apiClient.post<TriggerSyncResponse>('/sync/moodle/ecm');
    return data;
  },

  triggerSyncAll: async (): Promise<TriggerSyncAllResponse> => {
    const { data } = await apiClient.post<TriggerSyncAllResponse>('/sync/moodle/all');
    return data;
  },

  // Get sync logs
  getSyncLogs: async (params?: {
    job_type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<SyncLogsListResponse> => {
    const { data } = await apiClient.get<SyncLogsListResponse>('/sync/logs', { params });
    return data;
  },

  getSyncLog: async (id: number): Promise<SyncLog> => {
    const { data } = await apiClient.get<SyncLog>(`/sync/logs/${id}`);
    return data;
  },

  // Get statistics
  getStats: async (): Promise<SyncStats> => {
    const { data } = await apiClient.get<SyncStats>('/sync/stats');
    return data;
  },

  // Get task status (real-time)
  getTaskStatus: async (taskId: string): Promise<TaskStatus> => {
    const { data} = await apiClient.get<TaskStatus>(`/sync/task/${taskId}`);
    return data;
  },
};
