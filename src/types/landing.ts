/**
 * TypeScript types for Landing Page Builder
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file_upload';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface ConditionalDisplay {
  field_name: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_checked' | 'is_not_checked';
  value?: string;
}

export interface FormField {
  id: number;
  landing_page_id: number;
  field_type: FieldType;
  field_name: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  required: boolean;
  default_value?: string;
  validation_rules: Record<string, any>;
  options: FormFieldOption[];
  conditional_display?: ConditionalDisplay;
  maps_to_participant_field?: string;
  order_index: number;
  created_at: string;
}

export interface LandingPage {
  id: number;
  tenant_id: number;
  event_id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  hero_image_url?: string;
  is_active: boolean;
  is_published: boolean;
  requires_payment: boolean;
  stripe_price_id?: string;
  amount?: number;
  currency: string;
  theme_config: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
  seo_meta: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  success_message?: string;
  redirect_url?: string;
  total_views: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
  form_fields: FormField[];
}

export interface SubmissionData {
  form_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submission_id: number;
  participant_id: number;
  enrollment_id?: number;
  requires_payment: boolean;
  payment_url?: string;
  merge_details?: {
    action: 'created' | 'updated' | 'merged';
    fields_updated: string[];
    fields_skipped: string[];
  };
}

export interface LandingPageStats {
  total_views: number;
  total_submissions: number;
  event_title: string;
  available_slots?: number;
}
