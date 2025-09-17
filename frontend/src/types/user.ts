export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  teamId?: number;
  team?: Team;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER_TEACHER = "manager_teacher",
  TEACHER = "teacher",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  phone?: string;
  teamId?: number;
}

export interface UpdateUserForm {
  username?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  teamId?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
