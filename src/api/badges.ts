import { apiClient } from './client';

export interface BadgeElementConfig {
  id: string;
  type: 'text' | 'image' | 'qrcode' | 'field';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, any>;
  z_index: number;
}

export interface BadgeConfig {
  width: number;
  height: number;
  unit: 'mm' | 'px' | '%';
  background_color: string;
  background_image?: string;
  elements: BadgeElementConfig[];
}

export interface BadgeTemplate {
  id: number;
  tenant_id: number;
  event_id: number;
  name: string;
  description?: string;
  participant_type: 'all' | 'participant' | 'speaker' | 'staff';
  is_double_sided: boolean;
  front_config: BadgeConfig;
  back_config?: BadgeConfig;
  badges_per_page: number;
  page_orientation: 'portrait' | 'landscape';
  created_at: string;
  updated_at: string;
}

export interface BadgeTemplateCreate {
  event_id: number;
  name: string;
  description?: string;
  participant_type?: 'all' | 'participant' | 'speaker' | 'staff';
  is_double_sided?: boolean;
  front_config: BadgeConfig;
  back_config?: BadgeConfig;
  badges_per_page?: number;
  page_orientation?: 'portrait' | 'landscape';
}

export interface BadgeTemplateUpdate {
  name?: string;
  description?: string;
  participant_type?: 'all' | 'participant' | 'speaker' | 'staff';
  is_double_sided?: boolean;
  front_config?: BadgeConfig;
  back_config?: BadgeConfig;
  badges_per_page?: number;
  page_orientation?: 'portrait' | 'landscape';
}

export interface BadgeGenerateRequest {
  template_id: number;
  participant_ids: number[];
  include_speakers?: boolean;
  format?: 'pdf' | 'zip';
  double_sided?: boolean;
}

export const badgesAPI = {
  // Get all templates for an event
  getTemplates: async (eventId: number): Promise<{ total: number; templates: BadgeTemplate[] }> => {
    const { data } = await apiClient.get(`/events/${eventId}/badge-templates`);
    return data;
  },

  // Get single template
  getTemplate: async (eventId: number, templateId: number): Promise<BadgeTemplate> => {
    const { data } = await apiClient.get(`/events/${eventId}/badge-templates/${templateId}`);
    return data;
  },

  // Create template
  createTemplate: async (eventId: number, template: BadgeTemplateCreate): Promise<BadgeTemplate> => {
    const { data } = await apiClient.post(`/events/${eventId}/badge-templates`, template);
    return data;
  },

  // Update template
  updateTemplate: async (
    eventId: number,
    templateId: number,
    update: BadgeTemplateUpdate
  ): Promise<BadgeTemplate> => {
    const { data } = await apiClient.put(`/events/${eventId}/badge-templates/${templateId}`, update);
    return data;
  },

  // Delete template
  deleteTemplate: async (eventId: number, templateId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/badge-templates/${templateId}`);
  },

  // Export template
  exportTemplate: async (eventId: number, templateId: number): Promise<Blob> => {
    const { data } = await apiClient.post(
      `/events/${eventId}/badge-templates/${templateId}/export`,
      {},
      { responseType: 'blob' }
    );
    return data;
  },

  // Import template
  importTemplate: async (
    eventId: number,
    templateData: any,
    nameOverride?: string
  ): Promise<BadgeTemplate> => {
    const { data } = await apiClient.post(`/events/${eventId}/badge-templates/import`, {
      event_id: eventId,
      template_data: templateData,
      name_override: nameOverride,
    });
    return data;
  },

  // Generate badges
  generateBadges: async (eventId: number, request: BadgeGenerateRequest): Promise<Blob> => {
    const { data } = await apiClient.post(`/events/${eventId}/badges/generate`, request, {
      responseType: 'blob',
    });
    return data;
  },

  // Preview badge
  previewBadge: async (
    eventId: number,
    templateId: number,
    participantId?: number,
    side: 'front' | 'back' = 'front'
  ): Promise<Blob> => {
    const { data } = await apiClient.post(
      `/events/${eventId}/badges/preview`,
      {
        template_id: templateId,
        participant_id: participantId,
        side,
      },
      { responseType: 'blob' }
    );
    return data;
  },
};
