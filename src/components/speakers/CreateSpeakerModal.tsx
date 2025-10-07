import React, { useState, useEffect } from 'react';
import { X, Mic, AlertTriangle, Check } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';
import { Speaker } from '../../types/speaker';

interface CreateSpeakerModalProps {
  onClose: () => void;
  onSuccess: (speaker: Speaker) => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
}

interface DuplicateCheck {
  hasDuplicates: boolean;
  duplicates: Speaker[];
  matchType: 'email' | 'name' | null;
}

export const CreateSpeakerModal: React.FC<CreateSpeakerModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
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

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email || (formData.first_name && formData.last_name)) {
        checkDuplicates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, formData.first_name, formData.last_name]);

  const checkDuplicates = async () => {
    try {
      setChecking(true);
      const searches = [];

      // Check by email
      if (formData.email) {
        searches.push(speakersAPI.list({ search: formData.email, page_size: 5 }));
      }

      // Check by name
      if (formData.first_name && formData.last_name) {
        searches.push(
          speakersAPI.list({ search: `${formData.first_name} ${formData.last_name}`, page_size: 5 })
        );
      }

      const results = await Promise.all(searches);
      const allDuplicates: Speaker[] = [];
      let matchType: 'email' | 'name' | null = null;

      results.forEach((result) => {
        result.items.forEach((speaker) => {
          // Exact email match
          if (
            formData.email &&
            speaker.email?.toLowerCase() === formData.email.toLowerCase()
          ) {
            if (!allDuplicates.find((d) => d.id === speaker.id)) {
              allDuplicates.push(speaker);
              matchType = 'email';
            }
          }

          // Name match (similar)
          if (
            formData.first_name &&
            formData.last_name &&
            speaker.first_name.toLowerCase() === formData.first_name.toLowerCase() &&
            speaker.last_name.toLowerCase() === formData.last_name.toLowerCase()
          ) {
            if (!allDuplicates.find((d) => d.id === speaker.id)) {
              allDuplicates.push(speaker);
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Block if email duplicates found and not forced
    if (duplicateCheck.hasDuplicates && !forceCreate && duplicateCheck.matchType === 'email') {
      alert('Email già utilizzata. Verifica o forza la creazione.');
      return;
    }

    try {
      setSubmitting(true);

      const newSpeaker = await speakersAPI.create({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase() || undefined,
        phone: formData.phone.trim() || undefined,
        specialization: formData.specialization.trim() || undefined,
        bio: formData.bio.trim() || undefined,
      });

      onSuccess(newSpeaker);
      onClose();
    } catch (error: any) {
      console.error('Errore creazione relatore:', error);
      alert(error.response?.data?.detail || 'Errore durante la creazione del relatore');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectExisting = (speaker: Speaker) => {
    onSuccess(speaker);
    onClose();
  };

  const getMatchTypeLabel = () => {
    switch (duplicateCheck.matchType) {
      case 'email':
        return 'Email identica';
      case 'name':
        return 'Nome e cognome identici';
      default:
        return 'Possibile duplicato';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Nuovo Relatore</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mario"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              {errors.first_name && (
                <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cognome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rossi"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
              {errors.last_name && (
                <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="mario.rossi@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+39 123 456 7890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializzazione
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cardiologo, Nutrizionista, ecc."
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descrizione professionale del relatore..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Duplicate Check Status */}
          {checking && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">Controllo duplicati in corso...</p>
            </div>
          )}

          {/* Duplicate Warning */}
          {!checking && duplicateCheck.hasDuplicates && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-600" size={20} />
                <h3 className="font-semibold text-yellow-800">
                  Possibili duplicati trovati ({getMatchTypeLabel()})
                </h3>
              </div>

              <div className="space-y-2">
                {duplicateCheck.duplicates.map((duplicate) => (
                  <div
                    key={duplicate.id}
                    className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {duplicate.first_name} {duplicate.last_name}
                      </p>
                      {duplicate.email && (
                        <p className="text-sm text-gray-600">{duplicate.email}</p>
                      )}
                      {duplicate.specialization && (
                        <p className="text-xs text-gray-500">
                          Specializzazione: {duplicate.specialization}
                        </p>
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

              {duplicateCheck.matchType === 'email' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="forceCreate"
                    checked={forceCreate}
                    onChange={(e) => setForceCreate(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="forceCreate" className="text-sm text-yellow-800">
                    Crea comunque un nuovo relatore
                  </label>
                </div>
              )}
            </div>
          )}

          {/* No Duplicates */}
          {!checking &&
            !duplicateCheck.hasDuplicates &&
            (formData.email || (formData.first_name && formData.last_name)) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Check className="text-green-600" size={20} />
                  <p className="text-sm text-green-700">Nessun duplicato trovato</p>
                </div>
              </div>
            )}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Mic size={18} />
            <span>{submitting ? 'Creazione...' : 'Crea Relatore'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
