export interface Group {
  _id: string;
  name: string;
  description?: string;
  teachers:
    | Array<{
        _id: string;
        username: string;
        phone: string;
        role?: string;
      }>
    | string[];
  managers:
    | Array<{
        _id: string;
        username: string;
        phone: string;
        role?: string;
      }>
    | string[];
  students:
    | Array<{
        _id: string;
        name: string;
        gender: string;
        birthDate: string;
      }>
    | string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupInput {
  name: string;
  description?: string;
  teachers?: string[];
  managers?: string[];
  students?: string[];
}

export interface ApiResponse<T> {
  message?: string;
  group?: any;
  groups?: any;
  students?: any;
  users?: any;
  data?: T;
}
