import apiClient from './client';
import { Event } from '../types';

interface EventListResponse {
  items: Event[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface EventFilters {
  event_type?: 'ecm' | 'non_ecm';
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface EventCreate {
  // Basic fields
  title: string;
  event_type: 'ecm' | 'non_ecm' | 'congress';
  start_date: string;
  end_date: string;
  location?: string;
  max_participants?: number;
  status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  internal_notes?: string;
  moodle_course_id?: number;

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

export interface EventUpdate {
  // All fields are optional for partial updates
  title?: string;
  event_type?: 'ecm' | 'non_ecm' | 'congress';
  start_date?: string;
  end_date?: string;
  location?: string;
  max_participants?: number;
  status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  internal_notes?: string;

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

export const eventsAPI = {
  list: async (filters?: EventFilters): Promise<EventListResponse> => {
    const params = new URLSearchParams();
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('query', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('page_size', filters.per_page.toString());

    const response = await apiClient.get(`/events/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (event: EventCreate): Promise<Event> => {
    const response = await apiClient.post('/events/', event);
    return response.data;
  },

  update: async (id: number, event: EventUpdate): Promise<Event> => {
    const response = await apiClient.put(`/events/${id}`, event);
    return response.data;
  },
};
