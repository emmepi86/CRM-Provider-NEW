/**
 * Landing Pages Admin API Client (requires authentication)
 */
import { apiClient } from './client';
import type { LandingPage } from '../types/landing';

// Types specifici per admin
export interface LandingPageCreateData {
  event_id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  hero_image_url?: string;
  is_active?: boolean;
  is_published?: boolean;
  requires_payment?: boolean;
  stripe_price_id?: string;
  amount?: number;
  currency?: string;
  theme_config?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  success_message?: string;
  redirect_url?: string;
  form_fields: FormFieldCreateData[];
}

export interface FormFieldCreateData {
  field_type: 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file_upload';
  field_name: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  required: boolean;
  default_value?: string;
  validation_rules?: Record<string, any>;
  options?: Array<{ value: string; label: string }>;
  conditional_display?: Record<string, any>;
  maps_to_participant_field?: string;
  order_index: number;
}

export interface FormBuilderMetadata {
  available_field_types: Array<{ value: string; label: string }>;
  available_participant_mappings: Array<{
    field_name: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  validation_rules_examples: Record<string, any>;
}

export const landingPagesAdminAPI = {
  /**
   * Lista tutte le landing pages del tenant
   */
  list: async (): Promise<LandingPage[]> => {
    const { data } = await apiClient.get('/landing-pages/');
    return data;
  },

  /**
   * Recupera landing page per ID
   */
  getById: async (id: number): Promise<LandingPage> => {
    const { data } = await apiClient.get(`/landing-pages/${id}`);
    return data;
  },

  /**
   * Recupera landing page per evento
   */
  getByEvent: async (eventId: number): Promise<LandingPage> => {
    const { data } = await apiClient.get(`/landing-pages/event/${eventId}`);
    return data;
  },

  /**
   * Crea nuova landing page
   */
  create: async (landingPageData: LandingPageCreateData): Promise<LandingPage> => {
    const { data } = await apiClient.post('/landing-pages/', landingPageData);
    return data;
  },

  /**
   * Aggiorna landing page esistente
   */
  update: async (id: number, landingPageData: Partial<LandingPageCreateData>): Promise<LandingPage> => {
    const { data } = await apiClient.put(`/landing-pages/${id}`, landingPageData);
    return data;
  },

  /**
   * Elimina landing page
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/landing-pages/${id}`);
  },

  /**
   * Recupera metadata per form builder
   */
  getBuilderMetadata: async (): Promise<FormBuilderMetadata> => {
    const { data} = await apiClient.get('/landing-pages/metadata/builder');
    return data;
  }
};
