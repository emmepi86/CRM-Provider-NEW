import React, { useState } from 'react';
import { Edit2, Save, X, StickyNote } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';

interface SpeakerNotesEditProps {
  eventId: number;
  speakerId: number;
  eventSpeakerId: number;
  currentNotes?: string | null;
  onUpdate: () => void;
}

export const SpeakerNotesEdit: React.FC<SpeakerNotesEditProps> = ({
  eventId,
  speakerId,
  currentNotes,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await speakersAPI.updateEventSpeaker(eventId, speakerId, { notes });
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
      <div className="flex items-start space-x-2 mt-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Aggiungi note per questo evento..."
          rows={2}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
          autoFocus
        />
        <div className="flex flex-col space-y-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
            title="Salva"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Annulla"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-2 group cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {currentNotes ? (
        <div className="flex items-start space-x-2 bg-yellow-50 p-2 rounded">
          <StickyNote size={16} className="text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">{currentNotes}</p>
            <Edit2 size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 mt-1" />
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400 group-hover:text-gray-600 flex items-center space-x-1">
          <StickyNote size={14} />
          <span>+ Aggiungi note evento</span>
        </span>
      )}
    </div>
  );
};
