import { User } from "./user";

export interface Team {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface TeamSearchParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface TeamStats {
  memberCount: number;
  managerTeachers: Array<{
    id: number;
    name: string;
    username: string;
    email: string;
  }>;
}
