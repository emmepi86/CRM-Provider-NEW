/**
 * API client for Project Planner (Basecamp-inspired)
 */
import { apiClient } from './client';

export interface Project {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  color?: string;
  status: 'active' | 'archived' | 'completed' | 'on_hold';
  event_id?: number;
  custom_fields?: Record<string, any>;
  start_date?: string;
  due_date?: string;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  archived_at?: string;
  // Computed fields
  members_count?: number;
  todos_count?: number;
  completed_todos_count?: number;
  messages_count?: number;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface TodoList {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at?: string;
  items_count?: number;
  completed_items_count?: number;
  completion_percentage?: number;
  items?: TodoItem[];
}

export interface TodoItem {
  id: number;
  todo_list_id: number;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  completed_by?: number;
  assigned_to?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  position: number;
  custom_fields?: Record<string, any>;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  assignee_name?: string;
  creator_name?: string;
  completer_name?: string;
}

export interface ProjectMessage {
  id: number;
  project_id: number;
  title?: string;
  content: string;
  message_type: 'message' | 'announcement' | 'question';
  is_pinned: boolean;
  created_by: number;
  created_at: string;
  updated_at?: string;
  author_name?: string;
  author_email?: string;
  comments_count?: number;
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  activity_type: string;
  entity_type?: string;
  entity_id?: number;
  description?: string;
  user_id?: number;
  created_at: string;
  user_name?: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_todos: number;
  completed_todos: number;
  overdue_todos: number;
  recent_activity_count: number;
}

export interface ProjectDetailResponse extends Project {
  members: ProjectMember[];
  todo_lists: TodoList[];
  recent_messages: ProjectMessage[];
  milestones: any[];
  recent_activity: ProjectActivity[];
}

export const projectsAPI = {
  // Projects
  list: async (params?: { skip?: number; limit?: number; status?: string; my_projects?: boolean }) => {
    const { data } = await apiClient.get('/projects/', { params });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<ProjectStats>('/projects/stats');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ProjectDetailResponse>(`/projects/${id}`);
    return data;
  },

  create: async (projectData: {
    name: string;
    description?: string;
    color?: string;
    event_id?: number;
    start_date?: string;
    due_date?: string;
  }) => {
    const { data } = await apiClient.post<Project>('/projects/', projectData);
    return data;
  },

  update: async (id: number, projectData: Partial<Project>) => {
    const { data } = await apiClient.put<Project>(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Members
  addMember: async (projectId: number, memberData: { user_id: number; role: string }) => {
    const { data } = await apiClient.post<ProjectMember>(`/projects/${projectId}/members`, memberData);
    return data;
  },

  removeMember: async (projectId: number, userId: number) => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  // Todo Lists
  createTodoList: async (listData: { project_id: number; name: string; description?: string }) => {
    const { data } = await apiClient.post<TodoList>('/projects/todo-lists', listData);
    return data;
  },

  // Todo Items
  createTodoItem: async (itemData: {
    todo_list_id: number;
    title: string;
    description?: string;
    assigned_to?: number;
    priority?: string;
    due_date?: string;
  }) => {
    const { data } = await apiClient.post<TodoItem>('/projects/todo-items', itemData);
    return data;
  },

  toggleTodoCompletion: async (itemId: number, completed: boolean) => {
    const { data } = await apiClient.patch<TodoItem>(`/projects/todo-items/${itemId}/complete`, { completed });
    return data;
  },

  // Messages
  createMessage: async (messageData: {
    project_id: number;
    title?: string;
    content: string;
    message_type?: string;
  }) => {
    const { data } = await apiClient.post<ProjectMessage>('/projects/messages', messageData);
    return data;
  },

  // Activity
  getActivity: async (projectId: number, limit: number = 50) => {
    const { data } = await apiClient.get<ProjectActivity[]>(`/projects/${projectId}/activity`, {
      params: { limit }
    });
    return data;
  }
};
