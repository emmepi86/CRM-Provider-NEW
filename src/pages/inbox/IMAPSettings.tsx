import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, TestTube, CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import type { IMAPSettings as IMAPSettingsType } from '../../types/inbox';

export const IMAPSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<IMAPSettingsType>({
    imap_enabled: false,
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_username: '',
    imap_password: '',
    imap_use_ssl: true,
    imap_folder: 'INBOX',
    imap_sync_frequency: 5,
    // SMTP Settings
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_use_tls: true,
    smtp_use_ssl: false,
    smtp_sender_email: '',
    smtp_sender_name: '',
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      // Save first (test uses saved settings)
      await inboxAPI.updateSettings(settings);

      // Then test
      const result = await inboxAPI.testConnection();
      setTestResult(result);
    } catch (error) {
      console.error('Errore test:', error);
      setTestResult({
        success: false,
        message: 'Errore durante il test di connessione',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await inboxAPI.updateSettings(settings);
      alert('Impostazioni salvate con successo!');
      navigate('/inbox');
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const presets = {
    gmail: {
      imap_host: 'imap.gmail.com',
      imap_port: 993,
      imap_use_ssl: true,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_use_tls: true,
      smtp_use_ssl: false,
    },
    outlook: {
      imap_host: 'outlook.office365.com',
      imap_port: 993,
      imap_use_ssl: true,
      smtp_host: 'smtp.office365.com',
      smtp_port: 587,
      smtp_use_tls: true,
      smtp_use_ssl: false,
    },
  };

  const applyPreset = (preset: 'gmail' | 'outlook') => {
    setSettings({ ...settings, ...presets[preset] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/inbox')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurazione Email Personale</h1>
            <p className="text-gray-600">Configura IMAP (ricezione) e SMTP (invio) per la tua casella personale</p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Configurazione Rapida</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => applyPreset('gmail')}
            className="px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
          >
            📧 Gmail / Google Workspace
          </button>
          <button
            onClick={() => applyPreset('outlook')}
            className="px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
          >
            📨 Office 365 / Outlook
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Abilita Sincronizzazione IMAP
            </label>
            <p className="text-sm text-gray-500">
              Ricevi email automaticamente dalla tua casella esistente
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.imap_enabled}
              onChange={(e) => setSettings({ ...settings, imap_enabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          {/* IMAP Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server IMAP *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="imap.gmail.com"
              value={settings.imap_host}
              onChange={(e) => setSettings({ ...settings, imap_host: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Es: imap.gmail.com, outlook.office365.com, mail.tuodominio.it
            </p>
          </div>

          {/* Port & SSL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porta *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.imap_port}
                onChange={(e) => setSettings({ ...settings, imap_port: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usa SSL/TLS
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.imap_use_ssl ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, imap_use_ssl: e.target.value === 'true' })}
              >
                <option value="true">Sì (SSL - porta 993)</option>
                <option value="false">No (porta 143)</option>
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email / Username *
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="eventi@digitalhealth.sm"
              value={settings.imap_username}
              onChange={(e) => setSettings({ ...settings, imap_username: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={settings.imap_password}
              onChange={(e) => setSettings({ ...settings, imap_password: e.target.value })}
            />
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <HelpCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-yellow-800">
                  <strong>Gmail:</strong> Se hai attivato la verifica in 2 passaggi, devi usare una{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    App Password
                  </a>{' '}
                  invece della tua password normale.
                </div>
              </div>
            </div>
          </div>

          {/* Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cartella IMAP
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="INBOX"
              value={settings.imap_folder}
              onChange={(e) => setSettings({ ...settings, imap_folder: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Cartella da monitorare (solitamente INBOX)
            </p>
          </div>

          {/* Sync Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequenza Sincronizzazione (minuti)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.imap_sync_frequency}
              onChange={(e) => setSettings({ ...settings, imap_sync_frequency: parseInt(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ogni quanti minuti controllare nuove email (consigliato: 5)
            </p>
          </div>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Configurazione SMTP (Invio)</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura il server SMTP per inviare email dalla tua casella personale
          </p>
        </div>

        <div className="space-y-4">
          {/* SMTP Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server SMTP *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="smtp.gmail.com"
              value={settings.smtp_host || ''}
              onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Es: smtp.gmail.com, smtp.office365.com, smtp.tuodominio.it
            </p>
          </div>

          {/* Port & Encryption */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porta *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.smtp_port || 587}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usa TLS
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.smtp_use_tls ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, smtp_use_tls: e.target.value === 'true' })}
              >
                <option value="true">Sì (STARTTLS - porta 587)</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usa SSL
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.smtp_use_ssl ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, smtp_use_ssl: e.target.value === 'true' })}
              >
                <option value="true">Sì (SSL - porta 465)</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username SMTP *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="eventi@digitalhealth.sm"
              value={settings.smtp_username || ''}
              onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Solitamente uguale all'indirizzo email
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password SMTP *
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={settings.smtp_password || ''}
              onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa la stessa password/app password dell'IMAP
            </p>
          </div>

          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Mittente *
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="eventi@digitalhealth.sm"
                value={settings.smtp_sender_email || ''}
                onChange={(e) => setSettings({ ...settings, smtp_sender_email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Mittente
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mario Rossi"
                value={settings.smtp_sender_name || ''}
                onChange={(e) => setSettings({ ...settings, smtp_sender_name: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <HelpCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-blue-800">
                <strong>Nota:</strong> I parametri SMTP sono necessari per inviare risposte dall'Email Hub.
                Se non configurati, potrai solo ricevere email ma non rispondere.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`rounded-lg p-4 ${
            testResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {testResult.success ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div>
              <h4
                className={`font-semibold mb-1 ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {testResult.success ? 'Connessione Riuscita!' : 'Connessione Fallita'}
              </h4>
              <p
                className={`text-sm ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {testResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inbox')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annulla
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                <span>Test Connessione</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salva</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
