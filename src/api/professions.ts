import apiClient from './client';

export interface Profession {
  id: number;
  name: string;
  code?: string;
}

export interface Discipline {
  id: number;
  profession_id: number;
  name: string;
  code?: string;
}

export interface ProfessionDetailed extends Profession {
  disciplines: Discipline[];
}

export const professionsAPI = {
  list: async (): Promise<Profession[]> => {
    const response = await apiClient.get('/professions/');
    return response.data;
  },

  getDetailed: async (): Promise<ProfessionDetailed[]> => {
    const response = await apiClient.get('/professions/detailed');
    return response.data;
  },

  getDisciplines: async (professionId: number): Promise<Discipline[]> => {
    const response = await apiClient.get(`/professions/${professionId}/disciplines`);
    return response.data;
  },
};
