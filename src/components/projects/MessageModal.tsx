import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title?: string;
    content: string;
    message_type?: string;
    is_pinned?: boolean;
  }) => Promise<void>;
  message?: {
    id: number;
    title?: string;
    content: string;
    message_type: string;
    is_pinned: boolean;
  };
  projectId: number;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  message,
  projectId
}) => {
  const [title, setTitle] = useState(message?.title || '');
  const [content, setContent] = useState(message?.content || '');
  const [messageType, setMessageType] = useState(message?.message_type || 'message');
  const [isPinned, setIsPinned] = useState(message?.is_pinned || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!message;

  useEffect(() => {
    if (isOpen) {
      setTitle(message?.title || '');
      setContent(message?.content || '');
      setMessageType(message?.message_type || 'message');
      setIsPinned(message?.is_pinned || false);
    }
  }, [isOpen, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        title: title.trim() || undefined,
        content: content.trim(),
        message_type: messageType,
        is_pinned: isPinned
      });
      onClose();
    } catch (error) {
      console.error('Error saving message:', error);
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
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Modifica Messaggio' : 'Nuovo Messaggio'}
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo (opzionale)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Titolo del messaggio"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenuto <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Scrivi il tuo messaggio..."
            />
          </div>

          {/* Type and Pinned */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="message">💬 Messaggio</option>
                <option value="announcement">📢 Annuncio</option>
                <option value="question">❓ Domanda</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">📌 Fissa in alto</span>
              </label>
            </div>
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
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Pubblicazione...' : (isEdit ? 'Salva Modifiche' : 'Pubblica')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
