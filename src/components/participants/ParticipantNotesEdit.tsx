import React, { useState } from 'react';
import { Edit2, Save, X, StickyNote } from 'lucide-react';
import { participantsAPI } from '../../api/participants';

interface ParticipantNotesEditProps {
  participantId: number;
  currentNotes?: string;
  onUpdate: () => void;
}

export const ParticipantNotesEdit: React.FC<ParticipantNotesEditProps> = ({
  participantId,
  currentNotes,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await participantsAPI.update(participantId, { notes });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Errore salvataggio note:', error);
      alert('Errore durante il salvataggio delle note');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(currentNotes || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Aggiungi note generali sul partecipante..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          autoFocus
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{saving ? 'Salvataggio...' : 'Salva'}</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2"
          >
            <X size={16} />
            <span>Annulla</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {currentNotes ? (
        <div className="relative">
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
            {currentNotes}
          </p>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md flex items-center space-x-1 text-sm">
              <Edit2 size={14} />
              <span>Modifica</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors">
          <StickyNote size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
          <p className="text-gray-500 group-hover:text-blue-600 font-medium">
            + Aggiungi note sul partecipante
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Clicca per aggiungere annotazioni generali
          </p>
        </div>
      )}
    </div>
  );
};
