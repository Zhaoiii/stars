export interface Student {
  _id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
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
