import React, { useState } from 'react';
import { X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { eventsAPI, EventCreate } from '../../api/events';

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Section = 'basic' | 'venue' | 'fad' | 'ecm' | 'pricing' | 'registration';

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<EventCreate>({
    title: '',
    event_type: 'non_ecm',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: undefined,
    delivery_mode: undefined,
    event_format: undefined,
    status: 'draft',
    internal_notes: '',

    // ECM fields
    ecm_code: '',
    ecm_credits: '',
    ecm_provider_code: '',
    objective_id: '',
    ecm_hours: undefined,
    accreditation_type: undefined,
    provider_type: '',
    scientific_responsible: '',

    // Sessions
    has_modules: false,
    module_count: undefined,

    // FAD
    fad_platform: '',
    fad_url: '',
    fad_start_date: '',
    fad_end_date: '',
    fad_max_attempts: 5,

    // Residential
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_capacity: undefined,
    catering_included: false,
    parking_available: false,

    // Hybrid
    online_slots: undefined,
    onsite_slots: undefined,

    // Pricing
    base_price: undefined,
    early_bird_price: undefined,
    early_bird_deadline: '',
    vat_rate: 22.0,
    payment_methods: [],

    // Registration
    registration_deadline: '',
    event_url: '',

    // Documents
    program_pdf: '',
    brochure_pdf: '',
    materials_available: false,
    materials_url: '',
  });

  const [expandedSections, setExpandedSections] = useState<Set<Section>>(new Set(['basic'] as Section[]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSection = (section: Section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleChange = (field: keyof EventCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError('Le date di inizio e fine sono obbligatorie');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    try {
      setLoading(true);
      await eventsAPI.create(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.detail || 'Errore durante la creazione dell\'evento');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader: React.FC<{ title: string; section: Section; required?: boolean }> = ({ title, section, required }) => (
    <div
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </h3>
      {expandedSections.has(section) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Crea Nuovo Evento</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pb-6">
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* BASIC INFO SECTION */}
          <div className="border-b">
            <SectionHeader title="Informazioni Base" section="basic" required />
            {expandedSections.has('basic') && (
              <div className="p-6 space-y-4">
                {/* Titolo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo Evento *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Es: Corso ECM Cardiologia 2024"
                    required
                  />
                </div>

                {/* Tipo, Formato, Stato */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Evento *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => handleChange('event_type', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="non_ecm">Non ECM</option>
                      <option value="ecm">ECM</option>
                      <option value="congress">Congresso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                    <select
                      value={formData.event_format || ''}
                      onChange={(e) => handleChange('event_format', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Non specificato</option>
                      <option value="CORSO">Corso</option>
                      <option value="CONGRESSO">Congresso</option>
                      <option value="CONVEGNO">Convegno</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="SEMINARIO">Seminario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Bozza</option>
                      <option value="published">Pubblicato</option>
                      <option value="in_progress">In corso</option>
                      <option value="completed">Completato</option>
                      <option value="cancelled">Cancellato</option>
                    </select>
                  </div>
                </div>

                {/* Date e Modalità */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Fine *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modalità Erogazione</label>
                    <select
                      value={formData.delivery_mode || ''}
                      onChange={(e) => handleChange('delivery_mode', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Non specificata</option>
                      <option value="RESIDENTIAL">Residenziale</option>
                      <option value="FAD">FAD (Online)</option>
                      <option value="HYBRID">Ibrido</option>
                      <option value="WEBINAR">Webinar</option>
                    </select>
                  </div>
                </div>

                {/* Location e Max Partecipanti */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Luogo</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Es: Roma, Hotel Marriott"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numero Massimo Partecipanti</label>
                    <input
                      type="number"
                      value={formData.max_participants || ''}
                      onChange={(e) => handleChange('max_participants', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Illimitato"
                      min="1"
                    />
                  </div>
                </div>

                {/* Note Interne */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note Interne</label>
                  <textarea
                    value={formData.internal_notes}
                    onChange={(e) => handleChange('internal_notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Note e appunti interni..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* RESIDENTIAL/HYBRID VENUE SECTION */}
          {(formData.delivery_mode === 'RESIDENTIAL' || formData.delivery_mode === 'HYBRID') && (
            <div className="border-b">
              <SectionHeader title="Sede Evento (Residenziale)" section="venue" required={formData.delivery_mode === 'RESIDENTIAL' || formData.delivery_mode === 'HYBRID'} />
              {expandedSections.has('venue') && (
                <div className="p-6 space-y-4 bg-blue-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Sede *</label>
                    <input
                      type="text"
                      value={formData.venue_name}
                      onChange={(e) => handleChange('venue_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Es: Hotel Marriott Roma"
                      required={formData.delivery_mode === 'RESIDENTIAL' || formData.delivery_mode === 'HYBRID'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo *</label>
                      <input
                        type="text"
                        value={formData.venue_address}
                        onChange={(e) => handleChange('venue_address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Via Roma 123"
                        required={formData.delivery_mode === 'RESIDENTIAL' || formData.delivery_mode === 'HYBRID'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Città *</label>
                      <input
                        type="text"
                        value={formData.venue_city}
                        onChange={(e) => handleChange('venue_city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Roma"
                        required={formData.delivery_mode === 'RESIDENTIAL' || formData.delivery_mode === 'HYBRID'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capienza Sede</label>
                      <input
                        type="number"
                        value={formData.venue_capacity || ''}
                        onChange={(e) => handleChange('venue_capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        checked={formData.catering_included}
                        onChange={(e) => handleChange('catering_included', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Catering incluso</label>
                    </div>

                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        checked={formData.parking_available}
                        onChange={(e) => handleChange('parking_available', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Parcheggio disponibile</label>
                    </div>
                  </div>

                  {formData.delivery_mode === 'HYBRID' && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posti in Presenza *</label>
                        <input
                          type="number"
                          value={formData.onsite_slots || ''}
                          onChange={(e) => handleChange('onsite_slots', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          required={formData.delivery_mode === 'HYBRID'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posti Online *</label>
                        <input
                          type="number"
                          value={formData.online_slots || ''}
                          onChange={(e) => handleChange('online_slots', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          required={formData.delivery_mode === 'HYBRID'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FAD/WEBINAR/HYBRID ONLINE SECTION */}
          {(formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR' || formData.delivery_mode === 'HYBRID') && (
            <div className="border-b">
              <SectionHeader title="Piattaforma Online (FAD)" section="fad" required={formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR' || formData.delivery_mode === 'HYBRID'} />
              {expandedSections.has('fad') && (
                <div className="p-6 space-y-4 bg-green-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Piattaforma *</label>
                      <select
                        value={formData.fad_platform}
                        onChange={(e) => handleChange('fad_platform', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR' || formData.delivery_mode === 'HYBRID'}
                      >
                        <option value="">Seleziona...</option>
                        <option value="Moodle">Moodle</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Altra">Altra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Piattaforma *</label>
                      <input
                        type="url"
                        value={formData.fad_url}
                        onChange={(e) => handleChange('fad_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://..."
                        required={formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR' || formData.delivery_mode === 'HYBRID'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Apertura Piattaforma *</label>
                      <input
                        type="datetime-local"
                        value={formData.fad_start_date}
                        onChange={(e) => handleChange('fad_start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Chiusura Piattaforma *</label>
                      <input
                        type="datetime-local"
                        value={formData.fad_end_date}
                        onChange={(e) => handleChange('fad_end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={formData.delivery_mode === 'FAD' || formData.delivery_mode === 'WEBINAR'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Tentativi Quiz</label>
                      <input
                        type="number"
                        value={formData.fad_max_attempts || 5}
                        onChange={(e) => handleChange('fad_max_attempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ECM SECTION */}
          {formData.event_type === 'ecm' && (
            <div className="border-b">
              <SectionHeader title="Informazioni ECM" section="ecm" required />
              {expandedSections.has('ecm') && (
                <div className="p-6 space-y-4 bg-purple-50">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Codice ECM *</label>
                      <input
                        type="text"
                        value={formData.ecm_code}
                        onChange={(e) => handleChange('ecm_code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crediti ECM *</label>
                      <input
                        type="text"
                        value={formData.ecm_credits}
                        onChange={(e) => handleChange('ecm_credits', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="15.0"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Codice Provider *</label>
                      <input
                        type="text"
                        value={formData.ecm_provider_code}
                        onChange={(e) => handleChange('ecm_provider_code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Obiettivo Formativo (AGENAS) *</label>
                      <input
                        type="text"
                        value={formData.objective_id}
                        onChange={(e) => handleChange('objective_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Es: 1"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ore Formative *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.ecm_hours || ''}
                        onChange={(e) => handleChange('ecm_hours', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Accreditamento *</label>
                      <select
                        value={formData.accreditation_type || ''}
                        onChange={(e) => handleChange('accreditation_type', e.target.value as any || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required={formData.event_type === 'ecm'}
                      >
                        <option value="">Seleziona...</option>
                        <option value="RES">RES (Residenziale)</option>
                        <option value="FAD">FAD (Formazione a Distanza)</option>
                        <option value="FSC">FSC (Sul Campo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Responsabile Scientifico *</label>
                      <input
                        type="text"
                        value={formData.scientific_responsible}
                        onChange={(e) => handleChange('scientific_responsible', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Dr. Nome Cognome"
                        required={formData.event_type === 'ecm'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Provider</label>
                      <input
                        type="text"
                        value={formData.provider_type}
                        onChange={(e) => handleChange('provider_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Standard / Provisorio"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRICING SECTION */}
          <div className="border-b">
            <SectionHeader title="Costi e Pagamenti" section="pricing" />
            {expandedSections.has('pricing') && (
              <div className="p-6 space-y-4 bg-orange-50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo Base (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.base_price || ''}
                      onChange={(e) => handleChange('base_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo Early Bird (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.early_bird_price || ''}
                      onChange={(e) => handleChange('early_bird_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza Early Bird</label>
                    <input
                      type="date"
                      value={formData.early_bird_deadline}
                      onChange={(e) => handleChange('early_bird_deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aliquota IVA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vat_rate || 22.0}
                    onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* REGISTRATION SECTION */}
          <div className="border-b">
            <SectionHeader title="Iscrizioni e Materiali" section="registration" />
            {expandedSections.has('registration') && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza Iscrizioni</label>
                    <input
                      type="date"
                      value={formData.registration_deadline}
                      onChange={(e) => handleChange('registration_deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Evento Pubblico</label>
                    <input
                      type="url"
                      value={formData.event_url}
                      onChange={(e) => handleChange('event_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.materials_available}
                    onChange={(e) => handleChange('materials_available', e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Materiali didattici disponibili</label>
                </div>

                {formData.materials_available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Materiali</label>
                    <input
                      type="url"
                      value={formData.materials_url}
                      onChange={(e) => handleChange('materials_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creazione...' : 'Crea Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
