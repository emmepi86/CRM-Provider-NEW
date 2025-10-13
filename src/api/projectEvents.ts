/**
 * API client for Project Events (internal event/project management)
 */
import { apiClient } from './client';

export interface ProjectEvent {
  id: number;
  tenant_id: number;
  da_conf: boolean;
  data_inizio: string | null;
  ora: string[] | null;
  ecm: boolean;
  tipologia: string[] | null;
  progetto: string | null;
  presa_in_carico: string[] | null;
  provider: string | null;
  referente_progetto: string | null;
  location: string | null;
  ipad: string | null;
  critico: boolean;
  motivo_criticita: string | null;
  piattaforma: string[] | null;
  rimborso: string | null;
  rimborso_cliente: boolean;
  stato_informazioni: string | null;
  logistica_tecnici: string | null;
  landing_strutturata_url: string | null;
  landing_strutturata_text: string | null;
  landing_url: string | null;
  landing_text: string | null;
  link_webinar_url: string | null;
  link_webinar_text: string | null;
  drive_url: string | null;
  drive_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectEventCreate {
  da_conf?: boolean;
  data_inizio?: string | null;
  ora?: string[] | null;
  ecm?: boolean;
  tipologia?: string[] | null;
  progetto?: string | null;
  presa_in_carico?: string[] | null;
  provider?: string | null;
  referente_progetto?: string | null;
  location?: string | null;
  ipad?: string | null;
  critico?: boolean;
  motivo_criticita?: string | null;
  piattaforma?: string[] | null;
  rimborso?: string | null;
  rimborso_cliente?: boolean;
  stato_informazioni?: string | null;
  logistica_tecnici?: string | null;
  landing_strutturata_url?: string | null;
  landing_strutturata_text?: string | null;
  landing_url?: string | null;
  landing_text?: string | null;
  link_webinar_url?: string | null;
  link_webinar_text?: string | null;
  drive_url?: string | null;
  drive_text?: string | null;
}

export interface ProjectEventListResponse {
  items: ProjectEvent[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProjectEventFilters {
  page?: number;
  page_size?: number;
  search?: string;
  critico?: boolean;
  ecm?: boolean;
  data_inizio_from?: string;
  data_inizio_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const projectEventsAPI = {
  /**
   * List project events with filters and pagination
   */
  list: async (filters?: ProjectEventFilters): Promise<ProjectEventListResponse> => {
    const { data } = await apiClient.get('/project-events/', { params: filters });
    return data;
  },

  /**
   * Get a specific project event by ID
   */
  getById: async (id: number): Promise<ProjectEvent> => {
    const { data } = await apiClient.get(`/project-events/${id}`);
    return data;
  },

  /**
   * Create a new project event
   */
  create: async (eventData: ProjectEventCreate): Promise<ProjectEvent> => {
    const { data } = await apiClient.post('/project-events/', eventData);
    return data;
  },

  /**
   * Update a project event
   */
  update: async (id: number, eventData: Partial<ProjectEventCreate>): Promise<ProjectEvent> => {
    const { data } = await apiClient.put(`/project-events/${id}`, eventData);
    return data;
  },

  /**
   * Delete a project event
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/project-events/${id}`);
  },

  /**
   * Get statistics for project events
   */
  getStatistics: async (): Promise<any> => {
    const { data } = await apiClient.get('/project-events/statistics');
    return data;
  },
};
