import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { chatAPI } from '../../api/chat';

interface EditMessageModalProps {
  message: ChatMessage;
  onClose: () => void;
  onSuccess: (updatedMessage: ChatMessage) => void;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  message,
  onClose,
  onSuccess,
}) => {
  const [content, setContent] = useState(message.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Il messaggio non può essere vuoto');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updatedMessage = await chatAPI.editMessage(message.id, { content: content.trim() });
      onSuccess(updatedMessage);
      onClose();
    } catch (err: any) {
      console.error('Failed to edit message:', err);
      setError(err.response?.data?.detail || 'Errore durante la modifica del messaggio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Modifica Messaggio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Modifica il tuo messaggio..."
              autoFocus
              disabled={submitting}
            />

            <p className="mt-2 text-xs text-gray-500">
              Premi Invio per modificare il messaggio
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
