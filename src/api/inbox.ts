import apiClient from './client';
import type {
  EmailThread,
  ReceivedEmail,
  InboxStats,
  IMAPSettings,
  IMAPTestResponse,
  IMAPSyncResponse,
  ReplyRequest,
  ReplyResponse,
  ComposeEmailRequest,
  ComposeEmailResponse,
  ForwardEmailRequest,
  ForwardEmailResponse,
  ThreadsListResponse,
  EmailsListResponse,
} from '../types/inbox';

export const inboxAPI = {
  // ============================================
  // IMAP Settings
  // ============================================

  /**
   * Get IMAP configuration
   */
  getSettings: async (): Promise<IMAPSettings> => {
    const response = await apiClient.get('/inbox/settings');
    return response.data;
  },

  /**
   * Update IMAP configuration
   */
  updateSettings: async (settings: Partial<IMAPSettings>): Promise<{ status: string; message: string }> => {
    const response = await apiClient.put('/inbox/settings', settings);
    return response.data;
  },

  /**
   * Test IMAP connection
   */
  testConnection: async (): Promise<IMAPTestResponse> => {
    const response = await apiClient.post('/inbox/test-connection');
    return response.data;
  },

  /**
   * Trigger manual IMAP sync
   * @param fullSync - If true, fetch all emails from last 30 days. If false, only UNSEEN.
   */
  syncNow: async (fullSync: boolean = true): Promise<IMAPSyncResponse> => {
    const response = await apiClient.post('/inbox/sync-now', null, {
      params: { full_sync: fullSync }
    });
    return response.data;
  },

  // ============================================
  // Threads (Inbox)
  // ============================================

  /**
   * Get inbox threads (conversations)
   */
  getThreads: async (params?: {
    skip?: number;
    limit?: number;
    unread_only?: boolean;
    archived?: boolean;
    participant_id?: number;
    event_id?: number;
  }): Promise<ThreadsListResponse> => {
    const response = await apiClient.get('/inbox/threads', { params });
    return response.data;
  },

  /**
   * Get single thread details
   */
  getThread: async (threadId: number): Promise<EmailThread> => {
    const response = await apiClient.get(`/inbox/threads/${threadId}`);
    return response.data;
  },

  /**
   * Get all messages in a thread
   */
  getThreadMessages: async (threadId: number, markRead: boolean = true): Promise<EmailsListResponse> => {
    const response = await apiClient.get(`/inbox/threads/${threadId}/messages`, {
      params: { mark_read: markRead },
    });
    return response.data;
  },

  /**
   * Reply to thread
   */
  replyToThread: async (threadId: number, reply: ReplyRequest): Promise<ReplyResponse> => {
    const response = await apiClient.post(`/inbox/threads/${threadId}/reply`, reply);
    return response.data;
  },

  /**
   * Compose and send new email
   */
  composeEmail: async (email: ComposeEmailRequest): Promise<ComposeEmailResponse> => {
    const response = await apiClient.post('/inbox/compose', email);
    return response.data;
  },

  /**
   * Forward an email message
   */
  forwardMessage: async (messageId: number, forward: ForwardEmailRequest): Promise<ForwardEmailResponse> => {
    const response = await apiClient.post(`/inbox/messages/${messageId}/forward`, forward);
    return response.data;
  },

  // ============================================
  // Individual Messages
  // ============================================

  /**
   * Get single message
   */
  getMessage: async (messageId: number): Promise<ReceivedEmail> => {
    const response = await apiClient.get(`/inbox/messages/${messageId}`);
    return response.data;
  },

  /**
   * Mark message as read/unread
   */
  markAsRead: async (messageId: number, isRead: boolean = true): Promise<{ status: string }> => {
    const response = await apiClient.post(`/inbox/messages/${messageId}/mark-read`, {
      is_read: isRead,
    });
    return response.data;
  },

  /**
   * Assign message to user
   */
  assignMessage: async (messageId: number, userId: number | null): Promise<{ status: string }> => {
    const response = await apiClient.post(`/inbox/messages/${messageId}/assign`, {
      assigned_to: userId,
    });
    return response.data;
  },

  /**
   * Archive (soft delete) message
   */
  archiveMessage: async (messageId: number): Promise<{ status: string }> => {
    const response = await apiClient.delete(`/inbox/messages/${messageId}`);
    return response.data;
  },

  /**
   * Delete message from IMAP server (permanent delete)
   */
  deleteFromServer: async (messageId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/inbox/messages/${messageId}/delete-from-server`);
    return response.data;
  },

  /**
   * Move message to another IMAP folder
   */
  moveToFolder: async (messageId: number, destinationFolder: string, sourceFolder?: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/inbox/messages/${messageId}/move`, null, {
      params: {
        destination_folder: destinationFolder,
        source_folder: sourceFolder
      }
    });
    return response.data;
  },

  // ============================================
  // IMAP Folders
  // ============================================

  /**
   * List all IMAP folders
   */
  listFolders: async (): Promise<{ success: boolean; folders: Array<{ name: string; flags: string[] }>; message: string }> => {
    const response = await apiClient.get('/inbox/folders');
    return response.data;
  },

  /**
   * Create new IMAP folder
   */
  createFolder: async (folderName: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/inbox/folders', null, {
      params: { folder_name: folderName }
    });
    return response.data;
  },

  /**
   * Browse emails in a specific IMAP folder
   */
  browseFolder: async (folderName: string, limit: number = 50): Promise<{
    success: boolean;
    emails: Array<{
      uid: string;
      subject: string;
      from_name: string;
      from_email: string;
      date: string;
      is_read: boolean;
    }>;
    total: number;
    message: string;
  }> => {
    const response = await apiClient.get(`/inbox/folders/${encodeURIComponent(folderName)}/browse`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get full email content from IMAP folder by UID
   */
  getEmailFromFolder: async (folderName: string, uid: string): Promise<{
    success: boolean;
    email: {
      uid: string;
      subject: string;
      from_name: string;
      from_email: string;
      to: string;
      cc: string[];
      date: string;
      body_text: string;
      body_html: string;
      attachments: Array<{
        filename: string;
        content_type: string;
        size: number;
      }>;
      is_read: boolean;
    };
    message: string;
  }> => {
    const response = await apiClient.get(`/inbox/folders/${encodeURIComponent(folderName)}/emails/${uid}`);
    return response.data;
  },

  // ============================================
  // Stats
  // ============================================

  /**
   * Get inbox statistics
   */
  getStats: async (): Promise<InboxStats> => {
    const response = await apiClient.get('/inbox/stats');
    return response.data;
  },

  // ============================================
  // Email to Task Conversion
  // ============================================

  /**
   * Create a project task from an email message
   */
  createTaskFromEmail: async (
    messageId: number,
    taskData: {
      project_id: number;
      todo_list_id: number;
      title?: string;
      description?: string;
      priority?: string;
      assigned_to?: number;
      due_date?: string;
    }
  ): Promise<{
    success: boolean;
    task_id?: number;
    project_id?: number;
    todo_list_id?: number;
    message: string;
  }> => {
    const response = await apiClient.post(`/inbox/messages/${messageId}/create-task`, taskData);
    return response.data;
  },
};
