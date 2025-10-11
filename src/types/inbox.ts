// Email Hub Types

export interface EmailThread {
  id: number;
  tenant_id: number;
  subject: string | null;
  participant_id: number | null;
  event_id: number | null;
  message_count: number;
  unread_count: number;
  last_message_at: string | null;
  last_message_from: string | null;
  last_message_preview: string | null;
  is_archived: boolean;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  participant_name?: string | null;
  event_title?: string | null;
}

export interface ReceivedEmail {
  id: number;
  tenant_id: number;
  thread_id: number | null;
  message_id: string;
  in_reply_to: string | null;
  references: string[] | null;
  from_email: string;
  from_name: string | null;
  participant_id: number | null;
  to_email: string;
  cc_emails: string[];
  bcc_emails: string[];
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  has_attachments: boolean;
  attachments: EmailAttachment[];
  is_read: boolean;
  is_archived: boolean;
  is_spam: boolean;
  assigned_to: number | null;
  event_id: number | null;
  enrollment_id: number | null;
  spam_score: number | null;
  received_at: string;
  created_at: string;
  participant_name?: string | null;
  event_title?: string | null;
}

export interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
}

export interface InboxStats {
  total_threads: number;
  unread_threads: number;
  total_emails: number;
  unread_emails: number;
  emails_today: number;
  emails_this_week: number;
}

export interface IMAPSettings {
  // IMAP Settings (per ricevere)
  imap_enabled: boolean;
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
  imap_use_ssl: boolean;
  imap_folder: string;
  imap_sync_frequency: number;

  // SMTP Settings (per inviare dalla propria casella)
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_use_tls?: boolean;
  smtp_use_ssl?: boolean;
  smtp_sender_email?: string;
  smtp_sender_name?: string;
}

export interface IMAPTestResponse {
  success: boolean;
  message: string;
  folder_count?: number;
  message_count?: number;
}

export interface IMAPSyncResponse {
  success: boolean;
  new_emails: number;
  errors: string[];
}

export interface ReplyRequest {
  body_html: string;
  body_text?: string;
  cc_emails?: string[];
}

export interface ReplyResponse {
  success: boolean;
  email_log_id?: number;
  message: string;
}

export interface ThreadsListResponse {
  items: EmailThread[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmailsListResponse {
  items: ReceivedEmail[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmailAttachmentRequest {
  filename: string;
  content: string; // base64 encoded
  content_type: string;
}

export interface ComposeEmailRequest {
  to_email: string;
  subject: string;
  body_html: string;
  body_text?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  attachments?: EmailAttachmentRequest[];
}

export interface ComposeEmailResponse {
  success: boolean;
  email_log_id?: number;
  message: string;
}

export interface ForwardEmailRequest {
  to_email: string;
  body_html: string;
  body_text?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  attachments?: EmailAttachmentRequest[];
}

export interface ForwardEmailResponse {
  success: boolean;
  email_log_id?: number;
  message: string;
}
