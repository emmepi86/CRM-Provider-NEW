export type UserRole = 'superadmin' | 'admin' | 'operator' | 'viewer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  active: boolean;
  tenant_id: number;
  // Granular permissions
  can_use_chat: boolean;
  can_create_channels: boolean;
  can_use_projects: boolean;
  can_use_email_hub: boolean;
  can_use_landing_pages: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Event {
  id: number;
  title: string;
  event_type: 'ecm' | 'non_ecm' | 'congress';
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  location?: string;
  max_participants?: number;
  internal_notes?: string;
  moodle_course_id?: number;
  created_at: string;
  updated_at: string;

  // Event format
  delivery_mode?: 'RESIDENTIAL' | 'FAD' | 'HYBRID' | 'WEBINAR';
  event_format?: 'CORSO' | 'CONGRESSO' | 'CONVEGNO' | 'WORKSHOP' | 'SEMINARIO';

  // ECM fields
  ecm_code?: string;
  ecm_credits?: string;
  ecm_provider_code?: string;
  objective_id?: string;
  target_professions?: Array<{ professione: string; discipline: string[] }>;
  ecm_hours?: number;
  accreditation_type?: 'RES' | 'FAD' | 'FSC';
  provider_type?: string;
  scientific_responsible?: string;

  // Sessions/modules
  has_modules?: boolean;
  module_count?: number;

  // FAD specific
  fad_platform?: string;
  fad_url?: string;
  fad_start_date?: string;
  fad_end_date?: string;
  fad_max_attempts?: number;

  // Residential specific
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_capacity?: number;
  catering_included?: boolean;
  parking_available?: boolean;

  // Hybrid specific
  online_slots?: number;
  onsite_slots?: number;

  // Pricing
  base_price?: number;
  early_bird_price?: number;
  early_bird_deadline?: string;
  vat_rate?: number;
  payment_methods?: string[];

  // Registration
  registration_deadline?: string;
  event_url?: string;

  // Documents
  program_pdf?: string;
  brochure_pdf?: string;
  materials_available?: boolean;
  materials_url?: string;
}

export interface TravelNeeds {
  hotel_required?: boolean;
  flight_required?: boolean;
  dietary_restrictions?: string;
  special_requirements?: string;
  notes?: string;
}


export interface Participant {
  id: number;
  tenant_id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  fiscal_code?: string;
  gender?: string;
  birth_date?: string;
  birth_country?: string;
  birth_region?: string;
  birth_province?: string;
  birth_city?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  profession?: string;
  discipline?: string;
  specialization?: string;
  employment_type?: string;
  registered_order?: boolean;
  order_region?: string;
  order_number?: string;
  workplace_name?: string;
  workplace_address?: string;
  workplace_city?: string;
  workplace_zip?: string;
  workplace_province?: string;
  workplace_country?: string;
  vat_number?: string;
  notes?: string;
  travel_needs?: TravelNeeds;
  tags?: string[];
  moodle_user_id?: number;
  wordpress_user_id?: number;
  gdpr_consent_at?: string;
  gdpr_marketing_consent?: boolean;
  data_retention_until?: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  event_id: number;
  participant_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  payment_amount?: number;
  enrollment_date: string;
  notes?: string;
  event?: Event;
  participant?: Participant;
}

export interface DashboardStats {
  total_events: number;
  total_participants: number;
  enrollments_this_month: number;
  total_credits: number;
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
  activities?: any[];
  materials?: {
    id: number;
    name: string;
    modname: string;
    section: string;
    url?: string;
    visible: number;
    instance: number;
    completed: boolean;
    tracking: number;
    timecompleted?: number;
  }[];
}

export interface EventSession {
  id: number;
  event_id: number;
  tenant_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string | null;
  session_type: 'LECTURE' | 'WORKSHOP' | 'BREAK' | 'LUNCH' | 'REGISTRATION' | 'OTHER';
  is_online: boolean;
  is_onsite: boolean;
  room_name?: string | null;
  requires_attendance: boolean;
  min_attendance_minutes?: number | null;
  meeting_url?: string;
  max_capacity?: number;
  ecm_credits?: number;
  speaker_name?: string;
  speaker_bio?: string;
  materials_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionCreate {
  event_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  session_type: 'LECTURE' | 'WORKSHOP' | 'BREAK' | 'LUNCH' | 'REGISTRATION' | 'OTHER';
  is_online: boolean;
  meeting_url?: string;
  room?: string;
  max_capacity?: number;
  requires_attendance: boolean;
  ecm_credits?: number;
  speaker_name?: string;
  speaker_bio?: string;
  materials_url?: string;
  notes?: string;
}

export interface ProgramGeneratorRequest {
  event_id: number;
  conference_date: string;
  start_time: string;
  end_time: string;
  session_duration_minutes: number;
  break_duration_minutes: number;
  lunch_start_time?: string;
  lunch_duration_minutes?: number;
  session_titles?: string[];
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  enrollment_id: number;
  participant_id: number;
  check_in_time?: string;
  check_out_time?: string;
  duration_minutes?: number;
  attendance_status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  tenant_id: number;
  entity_type: 'event' | 'participant' | 'speaker' | 'enrollment';
  entity_id: number;
  folder_id?: number | null;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by_user_id?: number;
  tags: string[];
  uploaded_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface Folder {
  id: number;
  tenant_id: number;
  entity_type: 'event' | 'participant' | 'speaker' | 'enrollment';
  entity_id: number;
  parent_folder_id: number | null;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FolderCreate {
  entity_type: string;
  entity_id: number;
  parent_folder_id?: number | null;
  name: string;
  description?: string;
}

export interface FolderContents {
  folder: Folder;
  subfolders: Folder[];
  document_count: number;
}

export interface SystemSettings {
  id: number;
  tenant_id: number;
  badges_enabled: boolean;
  moodle_sync_enabled: boolean;
  sponsors_enabled: boolean;
  patronages_enabled: boolean;
  documents_enabled: boolean;
  webhooks_enabled: boolean;
  ecm_enabled: boolean;
  mailing_enabled: boolean;
  meetings_enabled: boolean;
  landing_pages_enabled: boolean;
  chat_enabled: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_use_tls?: boolean;
  smtp_use_ssl?: boolean;
  smtp_sender_email?: string;
  smtp_sender_name?: string;
  mailing_smtp_host?: string;
  mailing_smtp_port?: number;
  mailing_smtp_username?: string;
  mailing_smtp_password?: string;
  mailing_smtp_use_tls?: boolean;
  mailing_smtp_use_ssl?: boolean;
  mailing_smtp_sender_email?: string;
  mailing_smtp_sender_name?: string;
  jitsi_logo_url?: string;
  jitsi_primary_color?: string;
  jitsi_background_color?: string;
  custom_settings: Record<string, any>;
  notes?: string;
}

export interface SystemSettingsUpdate {
  badges_enabled?: boolean;
  moodle_sync_enabled?: boolean;
  sponsors_enabled?: boolean;
  patronages_enabled?: boolean;
  documents_enabled?: boolean;
  webhooks_enabled?: boolean;
  ecm_enabled?: boolean;
  mailing_enabled?: boolean;
  meetings_enabled?: boolean;
  landing_pages_enabled?: boolean;
  chat_enabled?: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_use_tls?: boolean;
  smtp_use_ssl?: boolean;
  smtp_sender_email?: string;
  smtp_sender_name?: string;
  mailing_smtp_host?: string;
  mailing_smtp_port?: number;
  mailing_smtp_username?: string;
  mailing_smtp_password?: string;
  mailing_smtp_use_tls?: boolean;
  mailing_smtp_use_ssl?: boolean;
  mailing_smtp_sender_email?: string;
  mailing_smtp_sender_name?: string;
  jitsi_logo_url?: string;
  jitsi_primary_color?: string;
  jitsi_background_color?: string;
  custom_settings?: Record<string, any>;
  notes?: string;
}

// Email System Types

export interface EmailRecipient {
  email: string;
  name?: string;
  participant_id?: number;
}

export interface EmailTemplate {
  id: number;
  tenant_id: number;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  category: string;
  is_system: boolean;
  variables: string[];
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface EmailSendRequest {
  recipients: EmailRecipient[];
  subject: string;
  body_html: string;
  body_text?: string;
  template_id?: number;
  event_id?: number;
  cc?: string[];
  bcc?: string[];
  variables?: Record<string, any>;
}

export interface EmailSendResponse {
  sent_count: number;
  failed_count: number;
  total: number;
  log_ids: number[];
  errors: string[];
}

export interface EmailLog {
  id: number;
  tenant_id: number;
  recipient_email: string;
  recipient_name?: string;
  participant_id?: number;
  subject: string;
  template_id?: number;
  event_id?: number;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'QUEUED';
  error_message?: string;
  sent_by?: number;
  sent_at: string;
  delivered_at?: string;
}

// Landing Page Builder Types
export * from './landing';
