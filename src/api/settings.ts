import apiClient from './client';
import { SystemSettings, SystemSettingsUpdate } from '../types';

export type { SystemSettings, SystemSettingsUpdate };

export const settingsAPI = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get('/settings/');
    return response.data;
  },

  updateSettings: async (updates: SystemSettingsUpdate): Promise<SystemSettings> => {
    const response = await apiClient.put('/settings/', updates);
    return response.data;
  },
};
