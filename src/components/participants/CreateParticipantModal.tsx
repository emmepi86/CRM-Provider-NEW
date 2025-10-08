import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { participantsAPI } from '../../api/participants';
import { professionsAPI, Profession, Discipline } from '../../api/professions';
import { Participant } from '../../types';

interface CreateParticipantModalProps {
  onClose: () => void;
  onSuccess: (participant: Participant) => void;
}

interface FormData {
  // Anagrafica base
  first_name: string;
  last_name: string;
  email: string;
  fiscal_code: string;
  gender: string;
  birth_date: string;
  birth_country: string;
  birth_region: string;
  birth_province: string;
  birth_city: string;

  // Contatti e residenza
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  country: string;

  // Dati professionali
  profession: string;
  discipline: string;
  specialization: string;
  employment_type: string;

  // Albo
  registered_order: boolean;
  order_region: string;
  order_number: string;

  // Dati lavorativi
  workplace_name: string;
  workplace_address: string;
  workplace_city: string;
  workplace_zip: string;
  workplace_province: string;
  workplace_country: string;
  vat_number: string;

  // Note
  notes: string;
  gdpr_marketing_consent: boolean;
}

interface DuplicateCheck {
  hasDuplicates: boolean;
  duplicates: Participant[];
  matchType: 'email' | 'fiscal_code' | 'name' | null;
}

interface SectionState {
  anagrafica: boolean;
  residenza: boolean;
  professionale: boolean;
  albo: boolean;
  lavorativo: boolean;
  note: boolean;
}

export const CreateParticipantModal: React.FC<CreateParticipantModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    // Anagrafica base
    first_name: '',
    last_name: '',
    email: '',
    fiscal_code: '',
    gender: '',
    birth_date: '',
    birth_country: '',
    birth_region: '',
    birth_province: '',
    birth_city: '',

    // Contatti e residenza
    phone: '',
    address: '',
    city: '',
    province: '',
    zip: '',
    country: 'ITALIA',

    // Dati professionali
    profession: '',
    discipline: '',
    specialization: '',
    employment_type: '',

    // Albo
    registered_order: false,
    order_region: '',
    order_number: '',

    // Dati lavorativi
    workplace_name: '',
    workplace_address: '',
    workplace_city: '',
    workplace_zip: '',
    workplace_province: '',
    workplace_country: '',
    vat_number: '',

    // Note
    notes: '',
    gdpr_marketing_consent: false,
  });

  const [expandedSections, setExpandedSections] = useState<SectionState>({
    anagrafica: true,
    residenza: false,
    professionale: false,
    albo: false,
    lavorativo: false,
    note: false,
  });

  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheck>({
    hasDuplicates: false,
    duplicates: [],
    matchType: null,
  });

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Professioni e discipline
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(null);

  // Carica professioni all'avvio
  useEffect(() => {
    fetchProfessions();
  }, []);

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email || formData.fiscal_code || (formData.first_name && formData.last_name)) {
        checkDuplicates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, formData.fiscal_code, formData.first_name, formData.last_name]);

  const fetchProfessions = async () => {
    try {
      const data = await professionsAPI.list();
      setProfessions(data);
    } catch (error) {
      console.error('Errore caricamento professioni:', error);
    }
  };

  const handleProfessionChange = async (professionName: string) => {
    setFormData({ ...formData, profession: professionName, discipline: '' });

    // Trova l'ID della professione dal nome
    const profession = professions.find(p => p.name === professionName);
    if (profession) {
      setSelectedProfessionId(profession.id);
      try {
        const data = await professionsAPI.getDisciplines(profession.id);
        setDisciplines(data);
      } catch (error) {
        console.error('Errore caricamento discipline:', error);
        setDisciplines([]);
      }
    } else {
      setSelectedProfessionId(null);
      setDisciplines([]);
    }
  };

  const checkDuplicates = async () => {
    try {
      setChecking(true);
      const searches = [];

      if (formData.email) {
        searches.push(participantsAPI.list({ query: formData.email, page_size: 5 }));
      }

      if (formData.fiscal_code) {
        searches.push(participantsAPI.list({ query: formData.fiscal_code, page_size: 5 }));
      }

      if (formData.first_name && formData.last_name) {
        searches.push(
          participantsAPI.list({ query: `${formData.first_name} ${formData.last_name}`, page_size: 5 })
        );
      }

      const results = await Promise.all(searches);
      const allDuplicates: Participant[] = [];
      let matchType: 'email' | 'fiscal_code' | 'name' | null = null;

      results.forEach((result) => {
        result.items.forEach((participant) => {
          if (
            formData.email &&
            participant.email?.toLowerCase() === formData.email.toLowerCase()
          ) {
            if (!allDuplicates.find((d) => d.id === participant.id)) {
              allDuplicates.push(participant);
              matchType = 'email';
            }
          }

          if (
            formData.fiscal_code &&
            participant.fiscal_code?.toUpperCase() === formData.fiscal_code.toUpperCase()
          ) {
            if (!allDuplicates.find((d) => d.id === participant.id)) {
              allDuplicates.push(participant);
              matchType = 'fiscal_code';
            }
          }

          if (
            formData.first_name &&
            formData.last_name &&
            participant.first_name.toLowerCase() === formData.first_name.toLowerCase() &&
            participant.last_name.toLowerCase() === formData.last_name.toLowerCase()
          ) {
            if (!allDuplicates.find((d) => d.id === participant.id)) {
              allDuplicates.push(participant);
              if (!matchType) matchType = 'name';
            }
          }
        });
      });

      setDuplicateCheck({
        hasDuplicates: allDuplicates.length > 0,
        duplicates: allDuplicates,
        matchType,
      });
    } catch (error) {
      console.error('Errore controllo duplicati:', error);
    } finally {
      setChecking(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome obbligatorio';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Cognome obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (formData.gender && !['M', 'F'].includes(formData.gender)) {
      newErrors.gender = 'Sesso non valido';
    }

    if (formData.province && formData.province.length !== 2) {
      newErrors.province = 'Sigla provincia deve essere di 2 caratteri';
    }

    if (formData.workplace_province && formData.workplace_province.length !== 2) {
      newErrors.workplace_province = 'Sigla provincia deve essere di 2 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (duplicateCheck.hasDuplicates && !forceCreate && duplicateCheck.matchType !== 'name') {
      alert('Sono stati trovati possibili duplicati. Verifica o forza la creazione.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        uuid: generateUUID(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        fiscal_code: formData.fiscal_code.trim().toUpperCase() || undefined,
        gender: formData.gender || undefined,
        birth_date: formData.birth_date || undefined,
        birth_country: formData.birth_country || undefined,
        birth_region: formData.birth_region || undefined,
        birth_province: formData.birth_province || undefined,
        birth_city: formData.birth_city || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        province: formData.province.trim().toUpperCase() || undefined,
        zip: formData.zip.trim() || undefined,
        country: formData.country || 'ITALIA',
        profession: formData.profession.trim() || undefined,
        discipline: formData.discipline.trim() || undefined,
        specialization: formData.specialization.trim() || undefined,
        employment_type: formData.employment_type || undefined,
        registered_order: formData.registered_order,
        order_region: formData.order_region.trim() || undefined,
        order_number: formData.order_number.trim() || undefined,
        workplace_name: formData.workplace_name.trim() || undefined,
        workplace_address: formData.workplace_address.trim() || undefined,
        workplace_city: formData.workplace_city.trim() || undefined,
        workplace_zip: formData.workplace_zip.trim() || undefined,
        workplace_province: formData.workplace_province.trim().toUpperCase() || undefined,
        workplace_country: formData.workplace_country.trim() || undefined,
        vat_number: formData.vat_number.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        gdpr_marketing_consent: formData.gdpr_marketing_consent,
      };

      const newParticipant = await participantsAPI.create(payload);
      onSuccess(newParticipant);
      onClose();
    } catch (error: any) {
      console.error('Errore creazione partecipante:', error);
      alert(error.response?.data?.detail || 'Errore durante la creazione del partecipante');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectExisting = (participant: Participant) => {
    onSuccess(participant);
    onClose();
  };

  const toggleSection = (section: keyof SectionState) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  const getMatchTypeLabel = () => {
    switch (duplicateCheck.matchType) {
      case 'email':
        return 'Email identica';
      case 'fiscal_code':
        return 'Codice fiscale identico';
      case 'name':
        return 'Nome e cognome identici';
      default:
        return 'Possibile duplicato';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Nuovo Partecipante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* SEZIONE ANAGRAFICA */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('anagrafica')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Dati Anagrafici <span className="text-red-500">*</span>
              </h3>
              {expandedSections.anagrafica ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.anagrafica && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cognome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sesso</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Seleziona...</option>
                      <option value="M">Maschio</option>
                      <option value="F">Femmina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                      maxLength={16}
                      value={formData.fiscal_code}
                      onChange={(e) => setFormData({ ...formData, fiscal_code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comune di Nascita</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.birth_city}
                      onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia di Nascita</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.birth_province}
                      onChange={(e) => setFormData({ ...formData, birth_province: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regione di Nascita</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.birth_region}
                      onChange={(e) => setFormData({ ...formData, birth_region: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nazione di Nascita</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.birth_country}
                      onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Duplicate Check */}
                {checking && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">Controllo duplicati...</p>
                  </div>
                )}

                {!checking && duplicateCheck.hasDuplicates && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="text-yellow-600" size={20} />
                      <h4 className="font-semibold text-yellow-800">
                        Possibili duplicati ({getMatchTypeLabel()})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {duplicateCheck.duplicates.map((duplicate) => (
                        <div
                          key={duplicate.id}
                          className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{duplicate.first_name} {duplicate.last_name}</p>
                            <p className="text-sm text-gray-600">{duplicate.email}</p>
                            {duplicate.fiscal_code && (
                              <p className="text-xs text-gray-500">CF: {duplicate.fiscal_code}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleSelectExisting(duplicate)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Usa questo
                          </button>
                        </div>
                      ))}
                    </div>

                    {duplicateCheck.matchType !== 'name' && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={forceCreate}
                          onChange={(e) => setForceCreate(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-yellow-800">Crea comunque</span>
                      </label>
                    )}
                  </div>
                )}

                {!checking && !duplicateCheck.hasDuplicates && formData.email && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Check className="text-green-600" size={18} />
                      <p className="text-sm text-green-700">Nessun duplicato</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEZIONE RESIDENZA */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('residenza')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Residenza</h3>
              {expandedSections.residenza ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.residenza && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia (es. RM)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                      maxLength={2}
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    />
                    {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      maxLength={10}
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nazione</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE PROFESSIONALE */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('professionale')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Dati Professionali</h3>
              {expandedSections.professionale ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.professionale && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professione</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.profession}
                      onChange={(e) => handleProfessionChange(e.target.value)}
                    >
                      <option value="">Seleziona professione...</option>
                      {professions.map((prof) => (
                        <option key={prof.id} value={prof.name}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.discipline}
                      onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                      disabled={!selectedProfessionId || disciplines.length === 0}
                    >
                      <option value="">
                        {selectedProfessionId ? 'Seleziona disciplina...' : 'Prima seleziona una professione'}
                      </option>
                      {disciplines.map((disc) => (
                        <option key={disc.id} value={disc.name}>
                          {disc.name}
                        </option>
                      ))}
                    </select>
                    {selectedProfessionId && disciplines.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Nessuna disciplina disponibile per questa professione</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specializzazione</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Impiego</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="">Seleziona...</option>
                      <option value="Dipendente pubblico">Dipendente pubblico</option>
                      <option value="Dipendente privato">Dipendente privato</option>
                      <option value="Libero professionista">Libero professionista</option>
                      <option value="Convenzionato SSN">Convenzionato SSN</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE ALBO */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('albo')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Iscrizione Albo/Ordine</h3>
              {expandedSections.albo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.albo && (
              <div className="p-4">
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.registered_order}
                      onChange={(e) => setFormData({ ...formData, registered_order: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium">Iscritto ad Albo/Ordine professionale</span>
                  </label>

                  {formData.registered_order && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Regione Albo</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.order_region}
                          onChange={(e) => setFormData({ ...formData, order_region: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numero Iscrizione</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.order_number}
                          onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE LAVORATIVA */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('lavorativo')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Dati Sede Lavorativa</h3>
              {expandedSections.lavorativo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.lavorativo && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Struttura</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="es. Ospedale San Giovanni"
                      value={formData.workplace_name}
                      onChange={(e) => setFormData({ ...formData, workplace_name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Sede</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.workplace_address}
                      onChange={(e) => setFormData({ ...formData, workplace_address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città Sede</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.workplace_city}
                      onChange={(e) => setFormData({ ...formData, workplace_city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia Sede (es. RM)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                      maxLength={2}
                      value={formData.workplace_province}
                      onChange={(e) => setFormData({ ...formData, workplace_province: e.target.value })}
                    />
                    {errors.workplace_province && (
                      <p className="text-xs text-red-500 mt-1">{errors.workplace_province}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP Sede</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      maxLength={10}
                      value={formData.workplace_zip}
                      onChange={(e) => setFormData({ ...formData, workplace_zip: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nazione Sede</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.workplace_country}
                      onChange={(e) => setFormData({ ...formData, workplace_country: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      maxLength={20}
                      value={formData.vat_number}
                      onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE NOTE */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('note')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Note e Consensi</h3>
              {expandedSections.note ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.note && (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.gdpr_marketing_consent}
                      onChange={(e) => setFormData({ ...formData, gdpr_marketing_consent: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">Consenso marketing</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || checking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creazione...' : 'Crea Partecipante'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
