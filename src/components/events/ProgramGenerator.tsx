import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import { sessionsAPI } from '../../api/sessions';
import { ProgramGeneratorRequest } from '../../types';

interface ProgramGeneratorProps {
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProgramGenerator: React.FC<ProgramGeneratorProps> = ({ eventId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProgramGeneratorRequest>({
    event_id: eventId,
    conference_date: '',
    start_time: '09:00',
    end_time: '17:00',
    session_duration_minutes: 90,
    break_duration_minutes: 15,
    lunch_start_time: '',
    lunch_duration_minutes: 60,
    session_titles: [],
  });
  const [customTitles, setCustomTitles] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.conference_date) {
      alert('Seleziona la data del programma');
      return;
    }

    try {
      setLoading(true);
      
      const titles = customTitles.trim() 
        ? customTitles.split('\n').map(t => t.trim()).filter(t => t.length > 0)
        : undefined;

      const requestData = {
        ...formData,
        session_titles: titles,
      };

      await sessionsAPI.generateProgram(requestData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Errore generazione programma:', error);
      alert('Errore durante la generazione del programma');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'session_duration_minutes' || name === 'break_duration_minutes' || name === 'lunch_duration_minutes') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const estimatedSessions = () => {
    const start = parseInt(formData.start_time.split(':')[0]) * 60 + parseInt(formData.start_time.split(':')[1]);
    const end = parseInt(formData.end_time.split(':')[0]) * 60 + parseInt(formData.end_time.split(':')[1]);
    const totalMinutes = end - start;
    
    let lunchMinutes = 0;
    if (formData.lunch_start_time) {
      lunchMinutes = formData.lunch_duration_minutes || 0;
    }
    
    const availableMinutes = totalMinutes - lunchMinutes;
    const sessionWithBreak = formData.session_duration_minutes + formData.break_duration_minutes;
    const sessions = Math.floor(availableMinutes / sessionWithBreak);
    
    return sessions;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Wand2 className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Genera Programma Automatico
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Genera automaticamente un programma giornaliero</strong> con sessioni di lezione e pause intervallate. 
              Puoi personalizzare durata, orari e titoli delle sessioni.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Programma *
            </label>
            <input
              type="date"
              name="conference_date"
              value={formData.conference_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Sessione (minuti) *
              </label>
              <input
                type="number"
                name="session_duration_minutes"
                value={formData.session_duration_minutes}
                onChange={handleChange}
                min="15"
                step="15"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Pausa (minuti) *
              </label>
              <input
                type="number"
                name="break_duration_minutes"
                value={formData.break_duration_minutes}
                onChange={handleChange}
                min="5"
                step="5"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pausa Pranzo (opzionale)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora Inizio Pranzo
                </label>
                <input
                  type="time"
                  name="lunch_start_time"
                  value={formData.lunch_start_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lascia vuoto per non includere pranzo
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durata Pranzo (minuti)
                </label>
                <input
                  type="number"
                  name="lunch_duration_minutes"
                  value={formData.lunch_duration_minutes}
                  onChange={handleChange}
                  min="30"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titoli Sessioni Personalizzati (opzionale)
            </label>
            <textarea
              value={customTitles}
              onChange={(e) => setCustomTitles(e.target.value)}
              rows={5}
              placeholder="Inserisci un titolo per riga:&#10;Introduzione al Corso&#10;Modulo 1: Concetti Base&#10;Modulo 2: Applicazioni Pratiche&#10;Workshop Interattivo&#10;Sessione di Chiusura"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se non specificati, verranno generati automaticamente (Session 1, Session 2, ecc.)
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Anteprima</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sessioni previste:</span>
                <span className="ml-2 font-semibold text-purple-600">{estimatedSessions()}</span>
              </div>
              <div>
                <span className="text-gray-600">Pause previste:</span>
                <span className="ml-2 font-semibold">{estimatedSessions()}</span>
              </div>
            </div>
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Wand2 size={18} />
              <span>{loading ? 'Generazione...' : 'Genera Programma'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
