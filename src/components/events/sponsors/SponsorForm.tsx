import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface SponsorFormProps {
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
  sponsor?: any; // Per edit (opzionale)
}

export const SponsorForm: React.FC<SponsorFormProps> = ({
  eventId,
  onClose,
  onSuccess,
  sponsor,
}) => {
  const [formData, setFormData] = useState({
    company_name: sponsor?.company_name || '',
    vat_number: sponsor?.vat_number || '',
    tax_code: sponsor?.tax_code || '',
    sector: sponsor?.sector || '',
    sponsorship_type: sponsor?.sponsorship_type || '',
    amount: sponsor?.amount || '',
    contract_date: sponsor?.contract_date || '',
    valid_from: sponsor?.valid_from || '',
    valid_to: sponsor?.valid_to || '',
    payment_status: sponsor?.payment_status || 'pending',
    contact_name: sponsor?.contact_name || '',
    contact_email: sponsor?.contact_email || '',
    contact_phone: sponsor?.contact_phone || '',
    notes: sponsor?.notes || '',
    editorial_independence_declared: sponsor?.editorial_independence_declared || false,
    conflict_of_interest_disclosed: sponsor?.conflict_of_interest_disclosed || false,
    sunshine_act_compliant: sponsor?.sunshine_act_compliant || false,
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
        contract_date: formData.contract_date || null,
        valid_from: formData.valid_from || null,
        valid_to: formData.valid_to || null,
      };

      if (sponsor) {
        // Update - NO event_id
        await axios.patch(
          `https://crm.digitalhealth.sm/api/v1/sponsors/${sponsor.id}`,
          basePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create - WITH event_id
        await axios.post(
          'https://crm.digitalhealth.sm/api/v1/sponsors',
          { ...basePayload, event_id: eventId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      alert('Errore durante il salvataggio dello sponsor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {sponsor ? 'Modifica Sponsor' : 'Nuovo Sponsor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dati Azienda */}
          <div>
            <h3 className="text-lg font-medium mb-4">Dati Azienda</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ragione Sociale *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partita IVA
                </label>
                <input
                  type="text"
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codice Fiscale
                </label>
                <input
                  type="text"
                  name="tax_code"
                  value={formData.tax_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Settore
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Farmaceutico">Farmaceutico</option>
                  <option value="Medical Device">Medical Device</option>
                  <option value="Diagnostica">Diagnostica</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sponsorizzazione */}
          <div>
            <h3 className="text-lg font-medium mb-4">Sponsorizzazione</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Sponsorizzazione
                </label>
                <select
                  name="sponsorship_type"
                  value={formData.sponsorship_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Grant educazionale incondizionato">Grant educazionale incondizionato</option>
                  <option value="Sponsorizzazione evento">Sponsorizzazione evento</option>
                  <option value="Sponsorizzazione materiali">Sponsorizzazione materiali</option>
                  <option value="Contributo iscrizioni">Contributo iscrizioni</option>
                </select>
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Contratto
                </label>
                <input
                  type="date"
                  name="contract_date"
                  value={formData.contract_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato Pagamento
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Da ricevere</option>
                  <option value="partial">Parziale</option>
                  <option value="completed">Completato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valido Da
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valido Fino
                </label>
                <input
                  type="date"
                  name="valid_to"
                  value={formData.valid_to}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Referente */}
          <div>
            <h3 className="text-lg font-medium mb-4">Referente Sponsor</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Conformità Normativa */}
          <div>
            <h3 className="text-lg font-medium mb-4">Conformità Normativa</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="editorial_independence_declared"
                  checked={formData.editorial_independence_declared}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Dichiarazione indipendenza editoriale</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="conflict_of_interest_disclosed"
                  checked={formData.conflict_of_interest_disclosed}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Conflict of Interest disclosure</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="sunshine_act_compliant"
                  checked={formData.sunshine_act_compliant}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Sunshine Act compliant</span>
              </label>
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : (sponsor ? 'Aggiorna' : 'Crea Sponsor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
