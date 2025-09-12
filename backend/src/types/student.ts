export interface IStudent {
  _id: string;
  name: string;
  gender: Gender;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  groups?: string[];
  assignedTeachers?: string[];
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export interface IStudentInput {
  name: string;
  gender: Gender;
  birthDate: string; // ISO日期字符串
}

export interface IStudentResponse {
  _id: string;
  name: string;
  gender: Gender;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  groups?: string[];
  assignedTeachers?: string[];
}
