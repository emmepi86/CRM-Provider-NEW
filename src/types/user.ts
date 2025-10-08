export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  active: boolean;
  tenant_id: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'viewer';

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  active?: boolean;
}

export interface PasswordChange {
  new_password: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}
