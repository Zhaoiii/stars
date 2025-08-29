import api from "../../../services/api";
import {
  Student,
  StudentFormData,
  StudentSearchParams,
} from "../../../types/student";

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
  static async createStudent(studentData: StudentFormData): Promise<Student> {
    const response = await api.post("/students", studentData);
    return response.data.student;
  }

  // 更新学生
  static async updateStudent(
    studentId: string,
    studentData: StudentFormData
  ): Promise<Student> {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data.student;
  }

  // 删除学生
  static async deleteStudent(studentId: string): Promise<void> {
    await api.delete(`/students/${studentId}`);
  }

  // 搜索学生
  static async searchStudents(
    searchParams: StudentSearchParams
  ): Promise<Student[]> {
    const params = new URLSearchParams();

    if (searchParams.name) params.append("name", searchParams.name);
    if (searchParams.gender) params.append("gender", searchParams.gender);
    if (searchParams.minAge)
      params.append("minAge", searchParams.minAge.toString());
    if (searchParams.maxAge)
      params.append("maxAge", searchParams.maxAge.toString());

    const response = await api.get(`/students/search?${params.toString()}`);
    return response.data.students;
  }
}
