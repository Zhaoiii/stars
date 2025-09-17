import { User } from "./user";

export interface Student {
  id: number;
  name: string;
  birthDate: string;
  gender: Gender;
  remarks?: string;
  teamId: number;
  team?: Team;
  teachers?: User[];
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

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface CreateStudentData {
  name: string;
  birthDate: string;
  gender: Gender;
  remarks?: string;
  teamId: number;
  teacherIds?: number[];
}

export type UpdateStudentData = {
  id: number;
} & CreateStudentData;

export interface StudentSearchParams {
  keyword?: string;
  teamId?: number;
  gender?: Gender;
}

export interface TeamStudentStats {
  total: number;
  byGender: Record<string, number>;
}
