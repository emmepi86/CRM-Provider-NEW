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
  moodle_user_id?: number;
  wordpress_user_id?: number;
  
  // Anagrafica
  gender?: string;
  birth_date?: string;
  birth_country?: string;
  birth_region?: string;
  birth_province?: string;
  birth_city?: string;
  
  // Contatti
  phone?: string;
  
  // Residenza
  address?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  
  // Professionale
  profession?: string;
  discipline?: string;
  specialization?: string;
  employment_type?: string;
  
  // Albo
  registered_order?: boolean;
  order_region?: string;
  order_number?: string;
  
  // Lavorativi
  workplace_name?: string;
  workplace_address?: string;
  workplace_city?: string;
  workplace_zip?: string;
  workplace_province?: string;
  workplace_country?: string;
  vat_number?: string;
  
  // Note e viaggi
  notes?: string;
  travel_needs?: TravelNeeds;
  tags?: string[];
  
  // GDPR
  gdpr_consent_at?: string;
  gdpr_marketing_consent?: boolean;
  data_retention_until?: string;
  
  created_at: string;
  updated_at: string;
}
