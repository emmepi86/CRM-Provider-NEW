import React, { useState } from 'react';
import { Edit2, Save, X, StickyNote } from 'lucide-react';
import { enrollmentsAPI } from '../../api/enrollments';

interface EnrollmentNotesEditProps {
  enrollmentId: number;
  currentNotes?: string;
  onUpdate: () => void;
}

export const EnrollmentNotesEdit: React.FC<EnrollmentNotesEditProps> = ({
  enrollmentId,
  currentNotes,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await enrollmentsAPI.update(enrollmentId, { notes });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Errore salvataggio note:', error);
      alert('Errore durante il salvataggio');
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
      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Aggiungi note..."
          className="px-2 py-1 border border-gray-300 rounded text-sm w-48"
          autoFocus
        />
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
    );
  }

  return (
    <div 
      className="flex items-center space-x-2 group cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {currentNotes ? (
        <>
          <StickyNote size={16} className="text-yellow-600" />
          <span className="text-sm text-gray-700 truncate max-w-xs" title={currentNotes}>
            {currentNotes}
          </span>
          <Edit2 size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
        </>
      ) : (
        <span className="text-sm text-gray-400 group-hover:text-gray-600">
          + Aggiungi note
        </span>
      )}
    </div>
  );
};
