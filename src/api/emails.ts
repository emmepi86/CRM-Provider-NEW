import apiClient from './client';
import { EmailTemplate, EmailSendRequest, EmailSendResponse, EmailLog } from '../types';

export const emailsAPI = {
  // Send email
  send: async (request: EmailSendRequest): Promise<EmailSendResponse> => {
    const { data } = await apiClient.post('/emails/send', request);
    return data;
  },

  // Test SMTP connection
  testSMTP: async (testEmail: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post('/emails/test', { test_email: testEmail });
    return data;
  },

  // Email Templates
  listTemplates: async (category?: string): Promise<EmailTemplate[]> => {
    const { data } = await apiClient.get('/emails/templates', {
      params: category ? { category } : undefined
    });
    return data;
  },

  getTemplate: async (templateId: number): Promise<EmailTemplate> => {
    const { data } = await apiClient.get(`/emails/templates/${templateId}`);
    return data;
  },

  createTemplate: async (template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data } = await apiClient.post('/emails/templates', template);
    return data;
  },

  updateTemplate: async (templateId: number, template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data } = await apiClient.put(`/emails/templates/${templateId}`, template);
    return data;
  },

  deleteTemplate: async (templateId: number): Promise<void> => {
    await apiClient.delete(`/emails/templates/${templateId}`);
  },

  // Email Logs
  listLogs: async (params?: {
    participant_id?: number;
    event_id?: number;
    status_filter?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ total: number; items: EmailLog[]; page: number; page_size: number }> => {
    const { data } = await apiClient.get('/emails/logs', { params });
    return data;
  },

  getLog: async (logId: number): Promise<EmailLog> => {
    const { data } = await apiClient.get(`/emails/logs/${logId}`);
    return data;
  },
};
