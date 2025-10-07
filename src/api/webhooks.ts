import { apiClient } from './client';

export interface WebhookLog {
  id: number;
  tenant_id: number;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  error_message?: string;
  received_at: string;
  processed_at?: string;
}

export interface WebhookLogsListResponse {
  total: number;
  logs: WebhookLog[];
}

export const webhooksAPI = {
  // Get webhook logs with optional filters
  getWebhookLogs: async (params?: {
    event_type?: string;
    status?: string;
    limit?: number;
  }): Promise<WebhookLogsListResponse> => {
    const { data } = await apiClient.get<WebhookLogsListResponse>('/webhooks/moodle/logs', { params });
    return data;
  },

  // Get webhook configuration info (URLs for Moodle setup)
  getWebhookInfo: async (): Promise<{
    base_url: string;
    endpoints: {
      enrollment_created: string;
      enrollment_completed: string;
      course_updated: string;
      activity_completed: string;
    };
    documentation: string;
  }> => {
    // This will be constructed from the frontend config
    const baseUrl = window.location.origin;
    const apiBase = '/api/v1';

    return {
      base_url: baseUrl,
      endpoints: {
        enrollment_created: `${baseUrl}${apiBase}/webhooks/moodle/enrollment/created`,
        enrollment_completed: `${baseUrl}${apiBase}/webhooks/moodle/enrollment/completed`,
        course_updated: `${baseUrl}${apiBase}/webhooks/moodle/course/updated`,
        activity_completed: `${baseUrl}${apiBase}/webhooks/moodle/activity/completed`,
      },
      documentation: 'Configure these webhook URLs in Moodle Admin > Plugins > Web services',
    };
  },

  // Test webhook endpoint connectivity
  testWebhook: async (endpoint: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': '1', // Test tenant
        },
        body: JSON.stringify({
          event: 'test',
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        return { status: 'success', message: 'Webhook endpoint is reachable' };
      } else {
        return { status: 'error', message: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Connection failed' };
    }
  },
};
