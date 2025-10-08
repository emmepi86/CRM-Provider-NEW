import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, AlertCircle } from 'lucide-react';
import { settingsAPI } from '../../api/settings';
import { SystemSettings, SystemSettingsUpdate } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperadmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [formData, setFormData] = useState<SystemSettingsUpdate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect if not superadmin
    if (!loading && !isSuperadmin()) {
      navigate('/');
      return;
    }

    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getSettings();
      setSettings(data);
      setFormData({
        badges_enabled: data.badges_enabled,
        moodle_sync_enabled: data.moodle_sync_enabled,
        sponsors_enabled: data.sponsors_enabled,
        patronages_enabled: data.patronages_enabled,
        documents_enabled: data.documents_enabled,
        webhooks_enabled: data.webhooks_enabled,
        notes: data.notes,
      });
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('Errore nel caricamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof SystemSettingsUpdate) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updated = await settingsAPI.updateSettings(formData);
      setSettings(updated);
      setSuccess('Impostazioni salvate con successo');

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.detail || 'Errore nel salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  if (!isSuperadmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <SettingsIcon className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impostazioni Sistema</h1>
            <p className="text-sm text-gray-600">Configura le funzionalità disponibili per questo tenant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
          <Shield className="text-purple-600" size={18} />
          <span className="text-sm font-medium text-purple-700">Superadmin</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Moduli e Funzionalità</h2>
          <p className="text-sm text-gray-600 mt-1">
            Attiva o disattiva le funzionalità disponibili nell'applicazione
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Badge Management */}
          <FeatureToggle
            title="Gestione Badge"
            description="Abilita la creazione, personalizzazione e stampa di badge per eventi"
            enabled={formData.badges_enabled ?? true}
            onToggle={() => handleToggle('badges_enabled')}
            icon="🏷️"
          />

          {/* Moodle Sync */}
          <FeatureToggle
            title="Sincronizzazione Moodle"
            description="Sincronizza automaticamente corsi, iscrizioni e progressi ECM da Moodle"
            enabled={formData.moodle_sync_enabled ?? true}
            onToggle={() => handleToggle('moodle_sync_enabled')}
            icon="🔄"
          />

          {/* Sponsors */}
          <FeatureToggle
            title="Gestione Sponsor"
            description="Gestisci sponsor aziendali per gli eventi (pharma-compliant)"
            enabled={formData.sponsors_enabled ?? true}
            onToggle={() => handleToggle('sponsors_enabled')}
            icon="🏢"
          />

          {/* Patronages */}
          <FeatureToggle
            title="Gestione Patrocini"
            description="Gestisci patrocini di società scientifiche e enti"
            enabled={formData.patronages_enabled ?? true}
            onToggle={() => handleToggle('patronages_enabled')}
            icon="🏆"
          />

          {/* Documents */}
          <FeatureToggle
            title="Gestione Documenti"
            description="Carica e organizza documenti per eventi, partecipanti e iscrizioni"
            enabled={formData.documents_enabled ?? true}
            onToggle={() => handleToggle('documents_enabled')}
            icon="📄"
          />

          {/* Webhooks */}
          <FeatureToggle
            title="Webhooks"
            description="Integrazione tramite webhook con sistemi esterni (avanzato)"
            enabled={formData.webhooks_enabled ?? false}
            onToggle={() => handleToggle('webhooks_enabled')}
            icon="🔗"
            warning="Funzionalità avanzata - richiede configurazione tecnica"
          />
        </div>

        {/* Notes */}
        <div className="px-6 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note di Configurazione
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Aggiungi note sulla configurazione del sistema..."
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={fetchSettings}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface FeatureToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: string;
  warning?: string;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  title,
  description,
  enabled,
  onToggle,
  icon,
  warning
}) => {
  return (
    <div className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="text-3xl mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {warning && (
              <p className="text-xs text-orange-600 mt-1 flex items-center space-x-1">
                <AlertCircle size={12} />
                <span>{warning}</span>
              </p>
            )}
          </div>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              enabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
