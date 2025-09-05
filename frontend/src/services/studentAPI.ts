import api from "./api";
import { Student, ApiResponse } from "../types/evaluationRecord";

export const studentAPI = {
  // 获取学生列表
  getStudents: () => {
    return api.get<ApiResponse<Student[]>>("/students");
  },

  // 获取单个学生
  getStudent: (id: string) => {
    return api.get<ApiResponse<Student>>(`/students/${id}`);
  },
};
