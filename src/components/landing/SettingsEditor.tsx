import React from 'react';
import { Settings, DollarSign, Mail, ExternalLink, Search } from 'lucide-react';

interface SettingsEditorProps {
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  requiresPayment: boolean;
  setRequiresPayment: (value: boolean) => void;
  stripePriceId: string;
  setStripePriceId: (value: string) => void;
  amount: number;
  setAmount: (value: number) => void;
  currency: string;
  setCurrency: (value: string) => void;
  successMessage: string;
  setSuccessMessage: (value: string) => void;
  redirectUrl: string;
  setRedirectUrl: (value: string) => void;
  seoMeta: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  setSeoMeta: (value: any) => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  isActive,
  setIsActive,
  isPublished,
  setIsPublished,
  requiresPayment,
  setRequiresPayment,
  stripePriceId,
  setStripePriceId,
  amount,
  setAmount,
  currency,
  setCurrency,
  successMessage,
  setSuccessMessage,
  redirectUrl,
  setRedirectUrl,
  seoMeta,
  setSeoMeta
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Impostazioni Generali
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configura visibilità, pagamenti, SEO e comportamento post-submission
        </p>
      </div>

      {/* Status Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Landing Page Attiva</p>
            <p className="text-sm text-gray-500">
              Se disattivata, la landing page non sarà accessibile pubblicamente
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Pubblica</p>
            <p className="text-sm text-gray-500">
              Se non pubblicata, sarà visibile solo agli admin
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Impostazioni Pagamento</h4>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Richiedi Pagamento</p>
            <p className="text-sm text-gray-500">
              Attiva per richiedere pagamento Stripe durante iscrizione
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={requiresPayment}
              onChange={(e) => setRequiresPayment(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {requiresPayment && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Price ID
              </label>
              <input
                type="text"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                placeholder="price_1ABC..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID prezzo creato su Stripe Dashboard. Esempio: price_1ABCdef123
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importo
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valuta
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success Message */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Mail className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Post-Submission</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Messaggio di Successo
          </label>
          <textarea
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            placeholder="Grazie per la tua iscrizione! Riceverai una email di conferma a breve."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Visualizzato nella success page dopo submission
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Redirect (opzionale)
          </label>
          <input
            type="url"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="https://example.com/grazie"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se impostato, l'utente verrà reindirizzato a questo URL dopo 2 secondi
          </p>
        </div>
      </div>

      {/* SEO Section */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Search className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">SEO & Meta Tags</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={seoMeta.title || ''}
              onChange={(e) => setSeoMeta({ ...seoMeta, title: e.target.value })}
              placeholder="Corso di Formazione 2025 - Iscriviti Ora"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              Massimo 60 caratteri. Visualizzato nei risultati di ricerca.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={seoMeta.description || ''}
              onChange={(e) => setSeoMeta({ ...seoMeta, description: e.target.value })}
              placeholder="Iscriviti al corso di formazione avanzata. 3 giorni intensivi con i migliori esperti del settore."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              Massimo 160 caratteri. Descrizione nei risultati di ricerca.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (separati da virgola)
            </label>
            <input
              type="text"
              value={seoMeta.keywords?.join(', ') || ''}
              onChange={(e) => setSeoMeta({
                ...seoMeta,
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              })}
              placeholder="formazione, corso, ECM, residenziale"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Parole chiave per motori di ricerca, separate da virgola
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <Settings className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">
              Raccomandazioni
            </p>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Pubblica solo quando la landing page è completamente configurata</li>
              <li>• Testa sempre il pagamento in modalità test prima di attivare in produzione</li>
              <li>• Ottimizza il SEO per migliorare la visibilità nei motori di ricerca</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
