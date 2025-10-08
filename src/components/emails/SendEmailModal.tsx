import React, { useState, useEffect } from 'react';
import { X, Mail, Send, AlertCircle } from 'lucide-react';
import { emailsAPI } from '../../api/emails';
import { EmailRecipient, EmailTemplate } from '../../types';

interface SendEmailModalProps {
  recipients: EmailRecipient[];
  eventId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  recipients,
  eventId,
  onClose,
  onSuccess
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailsAPI.listTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: number) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBodyHtml(template.body_html);
    }
  };

  const handleSend = async () => {
    if (!subject || !bodyHtml) {
      setError('Compilare oggetto e corpo del messaggio');
      return;
    }

    try {
      setSending(true);
      setError('');

      const result = await emailsAPI.send({
        recipients,
        subject,
        body_html: bodyHtml,
        template_id: selectedTemplate || undefined,
        event_id: eventId
      });

      if (result.failed_count > 0) {
        setError(`Inviate ${result.sent_count}/${result.total} email. Errori: ${result.errors.join(', ')}`);
      } else {
        alert(`Email inviate con successo a ${result.sent_count} destinatari!`);
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore durante l\'invio delle email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-600" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invia Email</h2>
                <p className="text-sm text-gray-600">{recipients.length} destinatari</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template (opzionale)
              </label>
              <select
                value={selectedTemplate || ''}
                onChange={(e) => handleTemplateSelect(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Nessun template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oggetto *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Oggetto dell'email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puoi usare variabili: {'{first_name}'}, {'{last_name}'}, {'{event_title}'}
              </p>
            </div>

            {/* Body HTML */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Messaggio *
              </label>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={12}
                placeholder="Corpo del messaggio (HTML supportato)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supporta HTML. Variabili disponibili: {'{first_name}'}, {'{last_name}'}, {'{full_name}'}, {'{email}'}, {'{event_title}'}, {'{event_start_date}'}
              </p>
            </div>

            {/* Recipients Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Destinatari ({recipients.length})</h3>
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-1">
                  {recipients.slice(0, 10).map((recipient, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      • {recipient.name} ({recipient.email})
                    </div>
                  ))}
                  {recipients.length > 10 && (
                    <div className="text-xs text-gray-500 italic">
                      ... e altri {recipients.length - 10} destinatari
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Annulla
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject || !bodyHtml}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={18} />
              <span>{sending ? 'Invio in corso...' : `Invia a ${recipients.length}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
