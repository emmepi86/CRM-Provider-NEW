import apiClient from './client';
import { LoginRequest, LoginResponse, User } from '../types';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // FastAPI OAuth2 si aspetta form-data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    // Usa apiClient ma override del Content-Type per questo endpoint
    const response = await apiClient.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.clear();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
