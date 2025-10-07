import apiClient from './client';
import { Document, DocumentListResponse } from '../types';

export const documentsAPI = {
  upload: async (
    entityType: string,
    entityId: number,
    file: File,
    tags: string = '',
    folderId?: number
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId.toString());
    formData.append('tags', tags);
    formData.append('file', file);
    
    if (folderId) {
      formData.append('folder_id', folderId.toString());
    }

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getByEntity: async (
    entityType: string,
    entityId: number
  ): Promise<DocumentListResponse> => {
    const response = await apiClient.get(`/documents/${entityType}/${entityId}`);
    return response.data;
  },

  delete: async (documentId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },

  move: async (documentId: number, newFolderId: number | null): Promise<Document> => {
    const response = await apiClient.put(`/documents/${documentId}/move`, null, {
      params: { folder_id: newFolderId },
    });
    return response.data.document;
  },

  updateTags: async (documentId: number, tags: string[]): Promise<Document> => {
    const response = await apiClient.put(`/documents/${documentId}/tags`, tags);
    return response.data;
  },
};
