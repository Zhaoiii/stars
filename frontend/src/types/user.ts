export interface User {
  _id: string;
  username: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface LoginForm {
  phone: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

