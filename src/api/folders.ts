import apiClient from './client';
import { Folder, FolderCreate, FolderContents } from '../types';

export const foldersAPI = {
  // Get all folders for an entity
  getByEntity: async (entityType: string, entityId: number): Promise<Folder[]> => {
    const response = await apiClient.get(`/folders/${entityType}/${entityId}`);
    return response.data;
  },

  // Get folder contents (subfolders + documents)
  getContents: async (folderId: number): Promise<FolderContents> => {
    const response = await apiClient.get(`/folders/id/${folderId}/contents`);
    return response.data;
  },

  // Create folder
  create: async (data: FolderCreate): Promise<Folder> => {
    const response = await apiClient.post('/folders', data);
    return response.data;
  },

  // Update folder
  update: async (
    folderId: number,
    data: { name?: string; description?: string }
  ): Promise<Folder> => {
    const response = await apiClient.put(`/folders/${folderId}`, data);
    return response.data;
  },

  // Move folder
  move: async (folderId: number, newParentId: number | null): Promise<Folder> => {
    const response = await apiClient.put(`/folders/${folderId}/move`, {
      new_parent_id: newParentId,
    });
    return response.data;
  },

  // Delete folder
  delete: async (folderId: number, force: boolean = false): Promise<void> => {
    await apiClient.delete(`/folders/${folderId}`, {
      params: { force },
    });
  },
};
