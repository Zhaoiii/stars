import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import {
  Student,
  StudentFormData,
  StudentSearchParams,
} from "../../../types/student";
import { StudentService } from "../services/studentService";

export const useStudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // 获取学生列表
  const fetchStudents = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const students = await StudentService.getAllStudents();
      setStudents(students);
    } catch (error: any) {
      message.error("获取学生列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建学生
  const createStudent = useCallback(
    async (studentData: StudentFormData): Promise<boolean> => {
      try {
        await StudentService.createStudent(studentData);
        message.success("学生创建成功");
        await fetchStudents();
        return true;
      } catch (error: any) {
        message.error(error.response?.data?.message || "创建学生失败");
        return false;
      }
    },
    [fetchStudents]
  );

  // 更新学生
  const updateStudent = useCallback(
    async (
      studentId: string,
      studentData: StudentFormData
    ): Promise<boolean> => {
      try {
        await StudentService.updateStudent(studentId, studentData);
        message.success("学生信息更新成功");
        await fetchStudents();
        return true;
      } catch (error: any) {
        message.error(error.response?.data?.message || "更新学生信息失败");
        return false;
      }
    },
    [fetchStudents]
  );

  // 删除学生
  const deleteStudent = useCallback(
    async (studentId: string): Promise<boolean> => {
      try {
        await StudentService.deleteStudent(studentId);
        message.success("学生删除成功");
        await fetchStudents();
        return true;
      } catch (error: any) {
        message.error("删除学生失败");
        return false;
      }
    },
    [fetchStudents]
  );

  // 搜索学生
  const searchStudents = useCallback(
    async (searchParams: StudentSearchParams): Promise<boolean> => {
      try {
        setLoading(true);
        const students = await StudentService.searchStudents(searchParams);
        setStudents(students);
        message.success("搜索完成");
        return true;
      } catch (error: any) {
        message.error("搜索学生失败");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 重置搜索
  const resetSearch = useCallback(async (): Promise<void> => {
    await fetchStudents();
  }, [fetchStudents]);

  // 设置编辑学生
  const setEditingStudentData = useCallback((student: Student | null) => {
    setEditingStudent(student);
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    editingStudent,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    resetSearch,
    setEditingStudentData,
  };
};
