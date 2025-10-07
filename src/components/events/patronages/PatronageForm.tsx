import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface PatronageFormProps {
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
  patronage?: any; // Per edit (opzionale)
}

export const PatronageForm: React.FC<PatronageFormProps> = ({
  eventId,
  onClose,
  onSuccess,
  patronage,
}) => {
  const [formData, setFormData] = useState({
    organization_name: patronage?.organization_name || '',
    organization_type: patronage?.organization_type || '',
    patronage_type: patronage?.patronage_type || '',
    patronage_code: patronage?.patronage_code || '',
    issue_date: patronage?.issue_date || '',
    expiry_date: patronage?.expiry_date || '',
    is_paid: patronage?.is_paid || false,
    amount: patronage?.amount || '',
    conditions: patronage?.conditions || '',
    notes: patronage?.notes || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      // Prepare base payload - convert empty strings to null for dates
      const basePayload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
      };

      if (patronage) {
        // Update - NO event_id
        await axios.patch(
          `https://crm.digitalhealth.sm/api/v1/patronages/${patronage.id}`,
          basePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create - WITH event_id
        await axios.post(
          'https://crm.digitalhealth.sm/api/v1/patronages',
          { ...basePayload, event_id: eventId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving patronage:', error);
      alert('Errore durante il salvataggio del patrocinio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {patronage ? 'Modifica Patrocinio' : 'Nuovo Patrocinio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ente Patrocinatore */}
          <div>
            <h3 className="text-lg font-medium mb-4">Ente Patrocinatore</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Organizzazione *
                </label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                  placeholder="es. Società Italiana di Cardiologia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Ente
                </label>
                <select
                  name="organization_type"
                  value={formData.organization_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Società scientifica">Società scientifica</option>
                  <option value="Ordine professionale">Ordine professionale</option>
                  <option value="Università">Università</option>
                  <option value="Istituto di ricerca">Istituto di ricerca</option>
                  <option value="Ente pubblico">Ente pubblico</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Patrocinio
                </label>
                <select
                  name="patronage_type"
                  value={formData.patronage_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Scientifico">Scientifico</option>
                  <option value="Istituzionale">Istituzionale</option>
                  <option value="Gratuito">Gratuito</option>
                  <option value="Oneroso">Oneroso</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dettagli Patrocinio */}
          <div>
            <h3 className="text-lg font-medium mb-4">Dettagli Patrocinio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero/Codice Patrocinio
                </label>
                <input
                  type="text"
                  name="patronage_code"
                  value={formData.patronage_code}
                  onChange={handleChange}
                  placeholder="es. Pat. 2025/042"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Rilascio
                </label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Contributo Economico */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contributo Economico</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_paid"
                  checked={formData.is_paid}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium">Patrocinio oneroso (a pagamento)</span>
              </label>

              {formData.is_paid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importo (€)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Condizioni */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condizioni
            </label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              rows={3}
              placeholder="Eventuali condizioni o clausole del patrocinio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Note aggiuntive..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : (patronage ? 'Aggiorna' : 'Crea Patrocinio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
