export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  tenant_id: number;
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
  event_type: 'ecm' | 'non_ecm';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  start_date: string;
  end_date: string;
  location?: string;
  max_participants?: number;
  credits?: number;
  ecm_code?: string;
  ecm_credits?: string;
  ecm_provider_code?: string;
  internal_notes?: string;
  moodle_course_id?: number;
  created_at: string;
  updated_at: string;
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
