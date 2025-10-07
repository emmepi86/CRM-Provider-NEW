import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { sessionsAPI } from '../../api/sessions';
import { EventSession, SessionCreate } from '../../types';

interface SessionFormProps {
  eventId: number;
  session?: EventSession | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({ eventId, session, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SessionCreate>({
    event_id: eventId,
    session_date: '',
    start_time: '',
    end_time: '',
    title: '',
    description: '',
    session_type: 'LECTURE',
    is_online: false,
    room: '',
    requires_attendance: true,
    speaker_name: '',
    ecm_credits: undefined,
    notes: '',
  });

  useEffect(() => {
    if (session) {
      setFormData({
        event_id: session.event_id,
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: session.end_time,
        title: session.title,
        description: session.description || '',
        session_type: session.session_type,
        is_online: session.is_online,
        room: (session as any).room_name || '',
        requires_attendance: session.requires_attendance,
        speaker_name: session.speaker_name || '',
        ecm_credits: session.ecm_credits,
        notes: session.notes || '',
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.session_date || !formData.start_time || !formData.end_time || !formData.title) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    try {
      setLoading(true);
      if (session) {
        await sessionsAPI.update(eventId, session.id, formData);
      } else {
        await sessionsAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Errore salvataggio sessione:', error);
      alert('Errore durante il salvataggio della sessione');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'ecm_credits') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {session ? 'Modifica Sessione' : 'Nuova Sessione'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Sessione *
              </label>
              <input
                type="date"
                name="session_date"
                value={formData.session_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Inizio *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Fine *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Sessione *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Es. Sessione di Apertura, Coffee Break, Workshop..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descrizione dettagliata della sessione..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Sessione *
            </label>
            <select
              name="session_type"
              value={formData.session_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LECTURE">Lezione</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="BREAK">Pausa</option>
              <option value="LUNCH">Pranzo</option>
              <option value="REGISTRATION">Registrazione</option>
              <option value="OTHER">Altro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_online"
                  checked={formData.is_online}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Sessione Online</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="requires_attendance"
                  checked={formData.requires_attendance}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Richiede Presenza</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sala / Location
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="Es. Aula Magna, Sala Congressi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relatore / Speaker
            </label>
            <input
              type="text"
              name="speaker_name"
              value={formData.speaker_name}
              onChange={handleChange}
              placeholder="Nome del relatore"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crediti ECM
            </label>
            <input
              type="number"
              name="ecm_credits"
              value={formData.ecm_credits || ''}
              onChange={handleChange}
              step="0.1"
              min="0"
              placeholder="Es. 2.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Interne
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Note private non visibili ai partecipanti..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : session ? 'Salva Modifiche' : 'Crea Sessione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
