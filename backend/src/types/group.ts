export interface IGroup {
  _id: string;
  name: string;
  description?: string;
  teachers: string[]; // User ids (teachers in group)
  managers: string[]; // User ids (subset of teachers or admins designated as group managers)
  students: string[]; // Student ids
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupInput {
  name: string;
  description?: string;
  teachers?: string[];
  managers?: string[];
  students?: string[];
}
