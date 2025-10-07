export interface Speaker {
  id: number;
  tenant_id: number;
  participant_id?: number | null;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  specialization?: string | null;
  photo_url?: string | null;
  cv_url?: string | null;
  profession_id?: number | null;
  discipline_id?: number | null;
  travel_needs: TravelNeeds;
  documents: SpeakerDocument[];
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelNeeds {
  hotel_required?: boolean;
  flight_required?: boolean;
  dietary_restrictions?: string;
  special_requirements?: string;
  notes?: string;
}

export interface SpeakerDocument {
  id: string;
  type: 'cv' | 'id_document' | 'certificate' | 'contract' | 'other';
  name: string;
  url: string;
  uploaded_at: string;
}

export interface SpeakerCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  photo_url?: string;
  cv_url?: string;
  participant_id?: number;
  profession_id?: number;
  discipline_id?: number;
  travel_needs?: TravelNeeds;
  documents?: SpeakerDocument[];
  notes?: string;
}

export interface SpeakerUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  photo_url?: string;
  cv_url?: string;
  participant_id?: number;
  profession_id?: number;
  discipline_id?: number;
  travel_needs?: TravelNeeds;
  documents?: SpeakerDocument[];
  notes?: string;
}

export interface SpeakersListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Speaker[];
}

export interface EventSpeaker {
  id: number;
  event_id: number;
  speaker_id: number;
  role: string;
  session_title?: string | null;
  session_datetime?: string | null;
  honorarium?: number | null;
  travel_booked: boolean;
  accommodation_booked: boolean;
  notes?: string | null;
  speaker?: Speaker;
}

export interface EventSpeakerCreate {
  speaker_id: number;
  role?: string;
  session_title?: string;
  session_datetime?: string;
  honorarium?: number;
  notes?: string;
}
