import { Group } from "../../../types/group";
import { User } from "../../../types/user";
import { Student } from "../../../types/student";

export type MemberType = "teachers" | "managers" | "students";

export interface GroupManagementState {
  loading: boolean;
  groups: Group[];
  createOpen: boolean;
  selectOpen: MemberType | null;
  currentGroup: Group | null;
  allUsers: User[];
  allStudents: Student[];
  selectedIds: string[];
}

export interface GroupTableColumn {
  title: string;
  dataIndex?: string;
  render?: (value: any, record: Group) => React.ReactNode;
}

export interface MemberSelectorProps {
  type: MemberType;
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  userOptions: Array<{ label: string; value: string }>;
  studentOptions: Array<{ label: string; value: string }>;
}

export interface GroupCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: any;
}

export interface GroupTableProps {
  groups: Group[];
  loading: boolean;
  onDelete: (record: Group) => void;
  onSelectMembers: (type: MemberType, group: Group) => void;
}
