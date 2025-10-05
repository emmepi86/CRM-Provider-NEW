import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { participantsAPI } from '../api/participants';
import { enrollmentsAPI } from '../api/enrollments';
import { Participant } from '../types';

interface EnrollParticipantModalProps {
  eventId: number;
  enrolledParticipantIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EnrollParticipantModal: React.FC<EnrollParticipantModalProps> = ({
  eventId,
  enrolledParticipantIds,
  onClose,
  onSuccess,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchParticipants();
    } else {
      setParticipants([]);
    }
  }, [searchTerm]);

  const searchParticipants = async () => {
    try {
      setLoading(true);
      const response = await participantsAPI.list({ search: searchTerm, limit: 20 });
      
      // Filtra solo i partecipanti NON già iscritti
      const availableParticipants = response.items.filter(
        (p) => !enrolledParticipantIds.includes(p.id)
      );
      
      setParticipants(availableParticipants);
    } catch (error) {
      console.error('Errore ricerca partecipanti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedParticipant) return;

    try {
      setSubmitting(true);
      await enrollmentsAPI.create(eventId, selectedParticipant.id);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Errore iscrizione:', error);
      alert(error.response?.data?.detail || 'Errore durante l\'iscrizione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Iscrivi Partecipante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca Partecipante
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome, cognome, email, codice fiscale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vengono mostrati solo i partecipanti non ancora iscritti a questo evento
            </p>
          </div>

          {loading && (
            <div className="text-center py-4 text-gray-500">Ricerca in corso...</div>
          )}

          {!loading && searchTerm.length >= 2 && participants.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Nessun partecipante disponibile per l'iscrizione
            </div>
          )}

          {participants.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  onClick={() => setSelectedParticipant(participant)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedParticipant?.id === participant.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.first_name} {participant.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{participant.email}</p>
                      {participant.fiscal_code && (
                        <p className="text-xs text-gray-500">CF: {participant.fiscal_code}</p>
                      )}
                    </div>
                    {selectedParticipant?.id === participant.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedParticipant && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Selezionato:</strong> {selectedParticipant.first_name} {selectedParticipant.last_name}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Annulla
          </button>
          <button
            onClick={handleEnroll}
            disabled={!selectedParticipant || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Iscrizione...' : 'Iscrivi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
