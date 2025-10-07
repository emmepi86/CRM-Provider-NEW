import React, { useEffect, useState } from 'react';
import { Mic, Plus, Trash2, DollarSign, Plane, Hotel, X } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';
import { EventSpeaker, Speaker, EventSpeakerCreate } from '../../types/speaker';
import { SpeakerNotesEdit } from './SpeakerNotesEdit';

interface EventSpeakersProps {
  eventId: number;
}

export const EventSpeakers: React.FC<EventSpeakersProps> = ({ eventId }) => {
  const [eventSpeakers, setEventSpeakers] = useState<EventSpeaker[]>([]);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<number | null>(null);
  const [newAssignment, setNewAssignment] = useState<EventSpeakerCreate>({
    speaker_id: 0,
    role: 'speaker',
    session_title: '',
    honorarium: undefined,
  });

  useEffect(() => {
    fetchEventSpeakers();
    fetchAllSpeakers();
  }, [eventId]);

  const fetchEventSpeakers = async () => {
    try {
      setLoading(true);
      const data = await speakersAPI.listByEvent(eventId);
      setEventSpeakers(data.speakers);
    } catch (error) {
      console.error('Errore caricamento relatori evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSpeakers = async () => {
    try {
      const data = await speakersAPI.list({ page_size: 100 });
      setAllSpeakers(data.items);
    } catch (error) {
      console.error('Errore caricamento relatori:', error);
    }
  };

  const handleAddSpeaker = async () => {
    if (!selectedSpeaker) {
      alert('Seleziona un relatore');
      return;
    }

    try {
      await speakersAPI.addToEvent(eventId, {
        ...newAssignment,
        speaker_id: selectedSpeaker,
      });
      setShowAddModal(false);
      setSelectedSpeaker(null);
      setNewAssignment({
        speaker_id: 0,
        role: 'speaker',
        session_title: '',
        honorarium: undefined,
      });
      fetchEventSpeakers();
    } catch (error) {
      console.error('Errore aggiunta relatore:', error);
      alert('Errore durante l\'aggiunta del relatore');
    }
  };

  const handleRemoveSpeaker = async (speakerId: number) => {
    if (!window.confirm('Rimuovere questo relatore dall\'evento?')) {
      return;
    }

    try {
      await speakersAPI.removeFromEvent(eventId, speakerId);
      fetchEventSpeakers();
    } catch (error) {
      console.error('Errore rimozione relatore:', error);
      alert('Errore durante la rimozione');
    }
  };

  // Filtra relatori già assegnati
  const availableSpeakers = allSpeakers.filter(
    (s) => !eventSpeakers.some((es) => es.speaker_id === s.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Relatori ({eventSpeakers.length})</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Aggiungi Relatore</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Caricamento...</p>
      ) : eventSpeakers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mic size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Nessun relatore assegnato a questo evento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventSpeakers.map((es) => (
            <div key={es.id} className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {es.speaker ? `${es.speaker.first_name} ${es.speaker.last_name}` : 'N/A'}
                  </h3>
                  {es.speaker?.specialization && (
                    <p className="text-sm text-gray-600">{es.speaker.specialization}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Ruolo:</span> {es.role}
                    </p>
                    {es.session_title && (
                      <p className="text-sm">
                        <span className="font-medium">Sessione:</span> {es.session_title}
                      </p>
                    )}
                    {es.honorarium && (
                      <p className="text-sm flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span className="font-medium">Compenso:</span> €{es.honorarium}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm mt-2">
                      {es.travel_booked && (
                        <span className="flex items-center text-green-600">
                          <Plane size={14} className="mr-1" />
                          Viaggio prenotato
                        </span>
                      )}
                      {es.accommodation_booked && (
                        <span className="flex items-center text-green-600">
                          <Hotel size={14} className="mr-1" />
                          Alloggio prenotato
                        </span>
                      )}
                    </div>
                  {/* Note relatore per questo evento */}
                  <SpeakerNotesEdit
                    eventId={eventId}
                    speakerId={es.speaker_id}
                    eventSpeakerId={es.id}
                    currentNotes={es.notes}
                    onUpdate={fetchEventSpeakers}
                  />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveSpeaker(es.speaker_id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Aggiungi Relatore */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Aggiungi Relatore</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Relatore *
                </label>
                <select
                  value={selectedSpeaker || ''}
                  onChange={(e) => setSelectedSpeaker(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona --</option>
                  {availableSpeakers.map((speaker) => (
                    <option key={speaker.id} value={speaker.id}>
                      {speaker.first_name} {speaker.last_name}
                      {speaker.specialization && ` - ${speaker.specialization}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruolo
                </label>
                <select
                  value={newAssignment.role}
                  onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="speaker">Relatore</option>
                  <option value="moderator">Moderatore</option>
                  <option value="keynote">Keynote Speaker</option>
                  <option value="panelist">Panelista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo Sessione
                </label>
                <input
                  type="text"
                  value={newAssignment.session_title || ''}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, session_title: e.target.value })
                  }
                  placeholder="es. Apertura, Sessione plenaria..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compenso (€)
                </label>
                <input
                  type="number"
                  value={newAssignment.honorarium || ''}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      honorarium: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddSpeaker}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
