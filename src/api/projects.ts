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
  comments?: ProjectMessageComment[];
}

export interface ProjectMessageComment {
  id: number;
  message_id: number;
  content: string;
  created_by: number;
  created_at: string;
  updated_at?: string;
  author_name?: string;
  author_email?: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
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
  milestones: ProjectMilestone[];
  recent_activity: ProjectActivity[];
}

export const projectsAPI = {
  // Projects
  list: async (params?: { skip?: number; limit?: number; status?: string; my_projects?: boolean }) => {
    const { data } = await apiClient.get('/projects/', { params });
    return data;
  },

  listByEvent: async (eventId: number, params?: { skip?: number; limit?: number }) => {
    const { data } = await apiClient.get(`/projects/by-event/${eventId}`, { params });
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

  updateMemberRole: async (projectId: number, userId: number, role: string) => {
    const { data } = await apiClient.put<ProjectMember>(`/projects/${projectId}/members/${userId}`, { role });
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

  // Todo Lists Management
  updateTodoList: async (listId: number, listData: { name?: string; description?: string; position?: number }) => {
    const { data } = await apiClient.put<TodoList>(`/projects/todo-lists/${listId}`, listData);
    return data;
  },

  deleteTodoList: async (listId: number) => {
    await apiClient.delete(`/projects/todo-lists/${listId}`);
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

  updateTodoItem: async (itemId: number, itemData: {
    title?: string;
    description?: string;
    assigned_to?: number;
    priority?: string;
    due_date?: string;
    position?: number;
  }) => {
    const { data } = await apiClient.put<TodoItem>(`/projects/todo-items/${itemId}`, itemData);
    return data;
  },

  deleteTodoItem: async (itemId: number) => {
    await apiClient.delete(`/projects/todo-items/${itemId}`);
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
    is_pinned?: boolean;
  }) => {
    const { data } = await apiClient.post<ProjectMessage>('/projects/messages', messageData);
    return data;
  },

  getMessage: async (messageId: number) => {
    const { data } = await apiClient.get<ProjectMessage>(`/projects/messages/${messageId}`);
    return data;
  },

  updateMessage: async (messageId: number, messageData: {
    title?: string;
    content?: string;
    message_type?: string;
    is_pinned?: boolean;
  }) => {
    const { data } = await apiClient.put<ProjectMessage>(`/projects/messages/${messageId}`, messageData);
    return data;
  },

  deleteMessage: async (messageId: number) => {
    await apiClient.delete(`/projects/messages/${messageId}`);
  },

  // Comments
  createComment: async (commentData: {
    message_id: number;
    content: string;
  }) => {
    const { data } = await apiClient.post('/projects/messages/comments', commentData);
    return data;
  },

  updateComment: async (commentId: number, content: string) => {
    const { data } = await apiClient.put(`/projects/messages/comments/${commentId}`, { content });
    return data;
  },

  deleteComment: async (commentId: number) => {
    await apiClient.delete(`/projects/messages/comments/${commentId}`);
  },

  // Activity
  getActivity: async (projectId: number, limit: number = 50) => {
    const { data } = await apiClient.get<ProjectActivity[]>(`/projects/${projectId}/activity`, {
      params: { limit }
    });
    return data;
  },

  // Milestones
  createMilestone: async (milestoneData: {
    project_id: number;
    name: string;
    description?: string;
    due_date: string;
  }) => {
    const { data } = await apiClient.post<ProjectMilestone>('/projects/milestones', milestoneData);
    return data;
  },

  updateMilestone: async (milestoneId: number, milestoneData: {
    name?: string;
    description?: string;
    due_date?: string;
    completed?: boolean;
  }) => {
    const { data } = await apiClient.put<ProjectMilestone>(`/projects/milestones/${milestoneId}`, milestoneData);
    return data;
  },

  deleteMilestone: async (milestoneId: number) => {
    await apiClient.delete(`/projects/milestones/${milestoneId}`);
  },

  toggleMilestoneCompletion: async (milestoneId: number, completed: boolean) => {
    const { data } = await apiClient.patch<ProjectMilestone>(`/projects/milestones/${milestoneId}/complete`, { completed });
    return data;
  }
};
