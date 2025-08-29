export interface IUser {
  _id: string;
  username: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface IUserInput {
  username: string;
  phone: string;
  password: string;
}

export interface ILoginInput {
  phone: string;
  password: string;
}

export interface IUserResponse {
  _id: string;
  username: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
