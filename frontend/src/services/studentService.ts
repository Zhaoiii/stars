import api, { ApiResponse, PaginatedResponse } from "@/services/api";
import {
  CreateStudentData,
  Student,
  StudentSearchParams,
  UpdateStudentData,
} from "@/types/student";

export class StudentService {
  // 获取所有学生
  static async getAllStudents(): Promise<Student[]> {
    const response = await api.get("/students");
    return response.data.students;
  }

  // 获取学生详情
  static async getStudentById(studentId: string): Promise<Student> {
    const response = await api.get(`/students/${studentId}`);
    return response.data.student;
  }

  // 创建学生
  static async createStudent(studentData: CreateStudentData) {
    const response = await api.post<ApiResponse<Student>>(
      "/students",
      studentData
    );
    return response.data;
  }

  // 更新学生
  static async updateStudent(studentData: UpdateStudentData) {
    const response = await api.put<ApiResponse<Student>>(
      `/students/${studentData.id}`,
      studentData
    );
    return response.data;
  }

  // 删除学生
  static async deleteStudent(studentId: string): Promise<void> {
    await api.delete(`/students/${studentId}`);
  }

  // 搜索学生
  static async searchStudents(searchParams: StudentSearchParams) {
    const params = new URLSearchParams();

    if (searchParams.keyword) params.append("keyword", searchParams.keyword);
    if (searchParams.gender) params.append("gender", searchParams.gender);

    const response = await api.get<PaginatedResponse<Student>>(
      `/students/search?${params.toString()}`
    );
    return response.data;
  }
}
