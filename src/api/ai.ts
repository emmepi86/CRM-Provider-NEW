/**
 * AI Assistant API Client
 * Email summarization, task extraction, and smart replies powered by OpenAI
 */
import { apiClient } from './client';

export interface AIStatus {
  available: boolean;
  features: string[];
}

export interface EmailSummary {
  email_id: number;
  summary: string;
  key_points: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  action_required: boolean;
  suggested_response?: string;
  processed_at: string;
  model: string;
}

export interface ExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  assignee_suggestion?: string;
}

export interface TaskExtractionResult {
  email_id: number;
  tasks: ExtractedTask[];
  tasks_found: number;
  auto_created: boolean;
  created_task_ids: number[];
  project_id?: number;
  processed_at: string;
  model: string;
}

export interface SmartReply {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
}

export interface EmailTextRequest {
  subject: string;
  body_html?: string;
  body_text?: string;
  from_email: string;
  from_name?: string;
}

export interface AIExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  assignee_suggestion?: string;
}

export interface CreateProjectFromAIRequest {
  project_id?: number;
  project_name?: string;
  project_description?: string;
  todo_list_name: string;
  source_email_id?: number;
  email_subject: string;
  email_from: string;
  email_date?: string;
  tasks: AIExtractedTask[];
}

export interface CreateProjectFromAIResponse {
  project_id: number;
  project_name: string;
  todo_list_id: number;
  todo_list_name: string;
  created_tasks: any[];
  tasks_count: number;
}

export const aiAPI = {
  /**
   * Check if AI Assistant is available and configured
   */
  getStatus: async (): Promise<AIStatus> => {
    const { data } = await apiClient.get('/ai/status');
    return data;
  },

  /**
   * Generate intelligent summary of an email
   */
  summarizeEmail: async (emailId: number): Promise<EmailSummary> => {
    const { data } = await apiClient.post(`/ai/emails/${emailId}/summarize`);
    return data;
  },

  /**
   * Extract actionable tasks from email content
   *
   * @param emailId - Email to analyze
   * @param projectId - Optional: Project to create tasks in
   * @param autoCreate - If true, automatically create tasks in the project
   */
  extractTasks: async (
    emailId: number,
    projectId?: number,
    autoCreate: boolean = false
  ): Promise<TaskExtractionResult> => {
    const { data } = await apiClient.post(`/ai/emails/${emailId}/extract-tasks`, {
      email_id: emailId,
      project_id: projectId,
      auto_create: autoCreate
    });
    return data;
  },

  /**
   * Generate a smart reply suggestion for an email
   *
   * @param emailId - Email to reply to
   * @param context - Additional context for the reply (optional)
   */
  generateSmartReply: async (
    emailId: number,
    context?: string
  ): Promise<SmartReply> => {
    const { data } = await apiClient.post(`/ai/emails/${emailId}/smart-reply`, {
      email_id: emailId,
      context
    });
    return data;
  },

  /**
   * Text-based AI operations (no database ID needed)
   * Works with IMAP emails that haven't been synced
   */

  /**
   * Summarize email from raw text
   */
  summarizeText: async (request: EmailTextRequest): Promise<any> => {
    const { data } = await apiClient.post('/ai/analyze-text/summarize', request);
    return data;
  },

  /**
   * Extract tasks from email text
   */
  extractTasksFromText: async (request: EmailTextRequest): Promise<any> => {
    const { data } = await apiClient.post('/ai/analyze-text/extract-tasks', request);
    return data;
  },

  /**
   * Generate smart reply from email text
   */
  generateSmartReplyFromText: async (request: EmailTextRequest & { context?: string }): Promise<any> => {
    const { data } = await apiClient.post('/ai/analyze-text/smart-reply', request);
    return data;
  },

  /**
   * Create project and tasks from AI-extracted tasks
   */
  createProjectFromTasks: async (request: CreateProjectFromAIRequest): Promise<CreateProjectFromAIResponse> => {
    const { data } = await apiClient.post<CreateProjectFromAIResponse>('/ai/create-project-from-tasks', request);
    return data;
  }
};
