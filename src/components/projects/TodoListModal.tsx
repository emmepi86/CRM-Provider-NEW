import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TodoListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => Promise<void>;
  todoList?: { id: number; name: string; description?: string };
  projectId: number;
}

export const TodoListModal: React.FC<TodoListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  todoList,
  projectId
}) => {
  const [name, setName] = useState(todoList?.name || '');
  const [description, setDescription] = useState(todoList?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!todoList;

  useEffect(() => {
    if (isOpen) {
      setName(todoList?.name || '');
      setDescription(todoList?.description || '');
    }
  }, [isOpen, todoList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error saving todo list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Modifica Lista' : 'Nuova Lista'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Es. Task da Email, Sviluppo, Marketing..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descrizione opzionale della lista"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Lista')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
