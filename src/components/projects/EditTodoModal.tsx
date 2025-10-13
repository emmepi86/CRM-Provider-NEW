import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TodoItem } from '../../api/projects';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: number;
  }) => Promise<void>;
  todoItem: TodoItem;
  projectMembers?: Array<{ id: number; user_id: number; user_name?: string }>;
}

export const EditTodoModal: React.FC<EditTodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  todoItem,
  projectMembers = []
}) => {
  const [title, setTitle] = useState(todoItem.title);
  const [description, setDescription] = useState(todoItem.description || '');
  const [priority, setPriority] = useState<string>(todoItem.priority || 'medium');
  const [dueDate, setDueDate] = useState(todoItem.due_date || '');
  const [assignedTo, setAssignedTo] = useState<number | undefined>(todoItem.assigned_to);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(todoItem.title);
      setDescription(todoItem.description || '');
      setPriority(todoItem.priority || 'medium');
      setDueDate(todoItem.due_date || '');
      setAssignedTo(todoItem.assigned_to);
    }
  }, [isOpen, todoItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(todoItem.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assigned_to: assignedTo
      });
      onClose();
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Modifica Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Titolo del task"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descrizione dettagliata del task"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorità
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scadenza
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Assigned To */}
          {projectMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assegnato a
              </label>
              <select
                value={assignedTo || ''}
                onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Non assegnato --</option>
                {projectMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_name || `User ${member.user_id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
