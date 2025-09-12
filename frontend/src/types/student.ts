export interface Student {
  _id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTeachers?:
    | Array<{
        _id: string;
        username: string;
        phone: string;
        role?: string;
      }>
    | string[];
  groups?: Array<{
    _id: string;
    name: string;
    teachers: Array<{
      _id: string;
      username: string;
      phone: string;
      role?: string;
    }>;
  }>;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export interface StudentFormData {
  name: string;
  gender: Gender;
  birthDate: string;
}

export interface StudentSearchParams {
  name?: string;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
}
