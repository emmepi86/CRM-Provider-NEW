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
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  fiscal_code?: string;
  profession?: string;
  specialization?: string;
  codicre_regionale?: string;
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
  enrolled_at: string;
  event?: Event;
  participant?: Participant;
}

export interface DashboardStats {
  total_events: number;
  total_participants: number;
  enrollments_this_month: number;
  total_credits: number;
}
