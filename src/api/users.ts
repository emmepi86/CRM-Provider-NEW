import apiClient from './client';
import { User, UserCreate, UserUpdate, UserListResponse, UserStats, PasswordChange } from '../types/user';

export const usersAPI = {
  /**
   * List users with pagination and search
   */
  list: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: UserCreate): Promise<User> => {
    const response = await apiClient.post('/users/', data);
    return response.data;
  },

  /**
   * Update user information
   */
  update: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (id: number, data: PasswordChange): Promise<User> => {
    const response = await apiClient.put(`/users/${id}/password`, data);
    return response.data;
  },

  /**
   * Delete user (soft delete - sets active=false)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
