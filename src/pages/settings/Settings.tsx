import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, AlertCircle, Mail, TestTube, Video } from 'lucide-react';
import { settingsAPI } from '../../api/settings';
import { emailsAPI } from '../../api/emails';
import { SystemSettings, SystemSettingsUpdate } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperadmin, user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [formData, setFormData] = useState<SystemSettingsUpdate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingMailingSmtp, setTestingMailingSmtp] = useState(false);
  const [mailingSmtpTestResult, setMailingSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username || '',
        smtp_password: data.smtp_password || '',
        smtp_use_tls: data.smtp_use_tls ?? true,
        smtp_use_ssl: data.smtp_use_ssl ?? false,
        smtp_sender_email: data.smtp_sender_email || '',
        smtp_sender_name: data.smtp_sender_name || '',
        mailing_smtp_host: data.mailing_smtp_host || '',
        mailing_smtp_port: data.mailing_smtp_port || 587,
        mailing_smtp_username: data.mailing_smtp_username || '',
        mailing_smtp_password: data.mailing_smtp_password || '',
        mailing_smtp_use_tls: data.mailing_smtp_use_tls ?? true,
        mailing_smtp_use_ssl: data.mailing_smtp_use_ssl ?? false,
        mailing_smtp_sender_email: data.mailing_smtp_sender_email || '',
        mailing_smtp_sender_name: data.mailing_smtp_sender_name || '',
        jitsi_logo_url: data.jitsi_logo_url || '',
        jitsi_primary_color: data.jitsi_primary_color || '#007bff',
        jitsi_background_color: data.jitsi_background_color || '#ffffff',
        notes: data.notes,
      });
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('Errore nel caricamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!user?.email) {
      setSmtpTestResult({ success: false, message: 'Email utente non trovata' });
      return;
    }

    try {
      setTestingSmtp(true);
      setSmtpTestResult(null);

      // Save current settings first
      await settingsAPI.updateSettings(formData);

      // Test SMTP
      const result = await emailsAPI.testSMTP(user.email);
      setSmtpTestResult(result);
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.response?.data?.detail || 'Errore durante il test SMTP'
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestMailingSmtp = async () => {
    if (!user?.email) {
      setMailingSmtpTestResult({ success: false, message: 'Email utente non trovata' });
      return;
    }

    try {
      setTestingMailingSmtp(true);
      setMailingSmtpTestResult(null);

      // Save current settings first
      await settingsAPI.updateSettings(formData);

      // Test Mailing SMTP
      const result = await emailsAPI.testSMTP(user.email, 'mailing');
      setMailingSmtpTestResult(result);
    } catch (err: any) {
      setMailingSmtpTestResult({
        success: false,
        message: err.response?.data?.detail || 'Errore durante il test SMTP Mailing'
      });
    } finally {
      setTestingMailingSmtp(false);
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

      {/* SMTP Configuration */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Configurazione SMTP</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Configura il server SMTP per l'invio di email dal sistema
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host SMTP
              </label>
              <input
                type="text"
                value={formData.smtp_host || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="number"
                value={formData.smtp_port || 587}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.smtp_username || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_username: e.target.value }))}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.smtp_password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Mittente
              </label>
              <input
                type="email"
                value={formData.smtp_sender_email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_sender_email: e.target.value }))}
                placeholder="noreply@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Mittente
              </label>
              <input
                type="text"
                value={formData.smtp_sender_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_sender_name: e.target.value }))}
                placeholder="CRM ECM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* TLS/SSL Options */}
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.smtp_use_tls ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_use_tls: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Usa TLS</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.smtp_use_ssl ?? false}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_use_ssl: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Usa SSL</span>
            </label>
          </div>

          {/* Test SMTP Result */}
          {smtpTestResult && (
            <div className={`p-3 rounded-lg ${smtpTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${smtpTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {smtpTestResult.message}
              </p>
            </div>
          )}
        </div>

        {/* SMTP Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleTestSmtp}
            disabled={testingSmtp || !formData.smtp_host}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <TestTube size={18} />
            <span>{testingSmtp ? 'Test in corso...' : 'Test Connessione'}</span>
          </button>
        </div>
      </div>

      {/* Mailing SMTP Configuration */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Mail className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Configurazione SMTP Mailing</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Configura un server SMTP separato per landing pages e campagne marketing
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Se non configurato, verrà utilizzato l'SMTP globale di default
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mailing SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host SMTP
              </label>
              <input
                type="text"
                value={formData.mailing_smtp_host || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_host: e.target.value }))}
                placeholder="smtp.sendgrid.net"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mailing SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="number"
                value={formData.mailing_smtp_port || 587}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_port: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mailing SMTP Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.mailing_smtp_username || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_username: e.target.value }))}
                placeholder="apikey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mailing SMTP Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password / API Key
              </label>
              <input
                type="password"
                value={formData.mailing_smtp_password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mailing Sender Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Mittente
              </label>
              <input
                type="email"
                value={formData.mailing_smtp_sender_email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_sender_email: e.target.value }))}
                placeholder="marketing@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mailing Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Mittente
              </label>
              <input
                type="text"
                value={formData.mailing_smtp_sender_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_sender_name: e.target.value }))}
                placeholder="CRM ECM Marketing"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* TLS/SSL Options */}
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.mailing_smtp_use_tls ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_use_tls: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Usa TLS</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.mailing_smtp_use_ssl ?? false}
                onChange={(e) => setFormData(prev => ({ ...prev, mailing_smtp_use_ssl: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Usa SSL</span>
            </label>
          </div>

          {/* Test Mailing SMTP Result */}
          {mailingSmtpTestResult && (
            <div className={`p-3 rounded-lg ${mailingSmtpTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${mailingSmtpTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {mailingSmtpTestResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Mailing SMTP Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleTestMailingSmtp}
            disabled={testingMailingSmtp || !formData.mailing_smtp_host}
            className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <TestTube size={18} />
            <span>{testingMailingSmtp ? 'Test in corso...' : 'Test Connessione Mailing'}</span>
          </button>
        </div>
      </div>

      {/* Jitsi Customization */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Video className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Personalizzazione Jitsi Meet</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Personalizza l'aspetto dei meeting virtuali con il tuo logo e i tuoi colori aziendali
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Logo Aziendale
            </label>
            <input
              type="url"
              value={formData.jitsi_logo_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, jitsi_logo_url: e.target.value }))}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inserisci l'URL di un'immagine PNG o SVG. Dimensioni consigliate: 200x50px
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colore Primario
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.jitsi_primary_color || '#007bff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, jitsi_primary_color: e.target.value }))}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.jitsi_primary_color || '#007bff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, jitsi_primary_color: e.target.value }))}
                  placeholder="#007bff"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Colore utilizzato per bottoni e elementi principali dell'interfaccia
              </p>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colore Sfondo
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.jitsi_background_color || '#ffffff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, jitsi_background_color: e.target.value }))}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.jitsi_background_color || '#ffffff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, jitsi_background_color: e.target.value }))}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Colore di sfondo principale dell'interfaccia meeting
              </p>
            </div>
          </div>

          {/* Preview Box */}
          <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Anteprima Colori:</p>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div
                  style={{ backgroundColor: formData.jitsi_background_color || '#ffffff' }}
                  className="h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                >
                  <button
                    style={{ backgroundColor: formData.jitsi_primary_color || '#007bff' }}
                    className="px-4 py-2 text-white rounded-lg font-medium shadow"
                  >
                    Pulsante Esempio
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Esempio di come appariranno i colori nell'interfaccia Jitsi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jitsi Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">
            ℹ️ Le modifiche ai colori e al logo si applicheranno automaticamente a tutti i nuovi meeting virtuali creati dopo il salvataggio.
          </p>
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
