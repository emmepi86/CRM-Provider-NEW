import { useState, useEffect } from 'react';
import { settingsAPI, SystemSettings } from '../api/settings';

const SETTINGS_CACHE_KEY = 'system_settings';
const SETTINGS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
        setLoading(false);
        return;
      }

      // Fetch from API
      const data = await settingsAPI.getSettings();
      setSettings(data);
      setCachedSettings(data);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');

      // Set default settings if API fails
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    clearSettingsCache();
    await loadSettings();
  };

  const getCachedSettings = (): SystemSettings | null => {
    try {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < SETTINGS_CACHE_DURATION) {
        return data;
      }

      // Cache expired
      localStorage.removeItem(SETTINGS_CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  };

  const setCachedSettings = (data: SystemSettings) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error caching settings:', err);
    }
  };

  const clearSettingsCache = () => {
    localStorage.removeItem(SETTINGS_CACHE_KEY);
  };

  const getDefaultSettings = (): SystemSettings => {
    return {
      id: 0,
      tenant_id: 0,
      badges_enabled: true,
      moodle_sync_enabled: true,
      sponsors_enabled: true,
      patronages_enabled: true,
      documents_enabled: true,
      webhooks_enabled: false,
      ecm_enabled: true,
      mailing_enabled: true,
      meetings_enabled: true,
      landing_pages_enabled: true,
      chat_enabled: true,
      custom_settings: {},
    };
  };

  return {
    settings,
    loading,
    error,
    refreshSettings,
  };
};
