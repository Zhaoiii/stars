import api from "./api";
import { ApiResponse, Group, GroupInput } from "../types/group";

export const groupAPI = {
  list: () => api.get<ApiResponse<Group[]>>("/groups"),
  get: (id: string) => api.get<ApiResponse<Group>>(`/groups/${id}`),
  create: (payload: GroupInput) =>
    api.post<ApiResponse<Group>>("/groups", payload),
  update: (id: string, payload: Partial<GroupInput>) =>
    api.put<ApiResponse<Group>>(`/groups/${id}`, payload),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/groups/${id}`),

  addTeachers: (groupId: string, teacherIds: string[]) =>
    api.post<ApiResponse<Group>>(`/groups/${groupId}/teachers`, { teacherIds }),
  setManagers: (groupId: string, managerIds: string[]) =>
    api.post<ApiResponse<Group>>(`/groups/${groupId}/managers`, { managerIds }),
  addStudents: (groupId: string, studentIds: string[]) =>
    api.post<ApiResponse<Group>>(`/groups/${groupId}/students`, { studentIds }),
  removeStudents: (groupId: string, studentIds: string[]) =>
    api.delete<ApiResponse<Group>>(`/groups/${groupId}/students`, {
      data: { studentIds },
    }),
};
