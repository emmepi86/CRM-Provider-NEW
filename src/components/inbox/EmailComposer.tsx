import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import { TinyMCEEditor } from '../common/TinyMCEEditor';

interface EmailComposerProps {
  threadId: number;
  onClose: () => void;
  onSuccess: () => void;
  initialBody?: string; // Optional initial body from AI
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  threadId,
  onClose,
  onSuccess,
  initialBody = '',
}) => {
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!body.trim()) {
      alert('Scrivi un messaggio prima di inviare');
      return;
    }

    try {
      setSending(true);
      const result = await inboxAPI.replyToThread(threadId, {
        body_html: body,
      });

      if (result.success) {
        alert('Email inviata con successo!');
        onSuccess();
      } else {
        alert(`Errore: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      alert('Errore durante l\'invio dell\'email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rispondi</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto">
          <TinyMCEEditor
            value={body}
            onChange={setBody}
            height={400}
            placeholder="Scrivi la tua risposta..."
            mode="email"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Invio...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Invia</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
