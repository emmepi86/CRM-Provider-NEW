import React, { useState } from 'react';
import { X, Send, Loader2, Paperclip, Trash2 } from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import { TinyMCEEditor } from '../common/TinyMCEEditor';
import type { EmailAttachmentRequest } from '../../types/inbox';

interface ComposeEmailModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [attachments, setAttachments] = useState<EmailAttachmentRequest[]>([]);
  const [sending, setSending] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: EmailAttachmentRequest[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Remove data:mime/type;base64, prefix
        const base64Content = base64.split(',')[1];

        newAttachments.push({
          filename: file.name,
          content: base64Content,
          content_type: file.type || 'application/octet-stream',
        });

        // Update state after all files are read
        if (newAttachments.length === files.length) {
          setAttachments([...attachments, ...newAttachments]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to.trim()) {
      alert('Inserisci almeno un destinatario');
      return;
    }

    if (!subject.trim()) {
      alert('Inserisci un oggetto');
      return;
    }

    if (!body.trim()) {
      alert('Scrivi un messaggio prima di inviare');
      return;
    }

    try {
      setSending(true);

      const ccEmails = cc
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const result = await inboxAPI.composeEmail({
        to_email: to.trim(),
        subject: subject.trim(),
        body_html: body,
        cc_emails: ccEmails.length > 0 ? ccEmails : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
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
          <h2 className="text-lg font-semibold text-gray-900">Nuova Email</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* To field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              A: *
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="destinatario@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* CC field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CC: <span className="text-gray-500 text-xs">(opzionale, separati da virgola)</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cc1@example.com, cc2@example.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Subject field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oggetto: *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Oggetto dell'email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allegati:
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              disabled={sending}
            />
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              disabled={sending}
            >
              <Paperclip className="w-4 h-4" />
              <span>Aggiungi allegato</span>
            </button>

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((att, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{att.filename}</span>
                      <span className="text-xs text-gray-500">
                        ({(att.content.length * 0.75 / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={sending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaggio: *
            </label>
            <TinyMCEEditor
              value={body}
              onChange={setBody}
              height={350}
              placeholder="Scrivi il tuo messaggio..."
              mode="email"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={sending}
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
