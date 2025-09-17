import { Repository, Like, In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Student } from "../entities/Student";
import { Gender } from "../types/enums";
import { User } from "../entities/User";
import { Team } from "../entities/Team";

export interface CreateStudentData {
  name: string;
  birthDate: string;
  gender: Gender;
  remarks?: string;
  teamId: number;
  teacherIds?: number[];
}

export interface UpdateStudentData {
  name?: string;
  birthDate?: string;
  gender?: Gender;
  remarks?: string;
  teamId?: number;
  teacherIds?: number[];
}

export interface SearchParams {
  keyword?: string;
  teamId?: number;
  page: number;
  limit: number;
}

export interface SearchResult {
  students: Student[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class StudentService {
  private studentRepository: Repository<Student>;
  private userRepository: Repository<User>;
  private teamRepository: Repository<Team>;

  constructor() {
    this.studentRepository = AppDataSource.getRepository(Student);
    this.userRepository = AppDataSource.getRepository(User);
    this.teamRepository = AppDataSource.getRepository(Team);
  }

  // 创建学生
  async createStudent(studentData: CreateStudentData): Promise<Student | null> {
    // 验证团队是否存在
    const team = await this.teamRepository.findOne({
      where: { id: studentData.teamId },
    });
    if (!team) {
      throw new Error("团队不存在");
    }

    // 验证教师是否存在（如果提供了教师ID）
    if (studentData.teacherIds && studentData.teacherIds.length > 0) {
      const teachers = await this.userRepository.find({
        where: { id: In(studentData.teacherIds) },
      });
      if (teachers.length !== studentData.teacherIds.length) {
        throw new Error("部分教师不存在");
      }
    }

    const student = this.studentRepository.create({
      name: studentData.name,
      birthDate: studentData.birthDate,
      gender: studentData.gender,
      remarks: studentData.remarks,
      teamId: studentData.teamId,
    });

    const savedStudent = await this.studentRepository.save(student);

    // 如果提供了教师ID，建立关联关系
    if (studentData.teacherIds && studentData.teacherIds.length > 0) {
      const teachers = await this.userRepository.find({
        where: { id: In(studentData.teacherIds) },
      });
      savedStudent.teachers = teachers;
      await this.studentRepository.save(savedStudent);
    }

    return await this.getStudentById(savedStudent.id);
  }

  // 根据ID获取学生
  async getStudentById(id: number): Promise<Student | null> {
    return await this.studentRepository.findOne({
      where: { id },
      relations: ["team", "teachers"],
    });
  }

  // 更新学生
  async updateStudent(
    id: number,
    studentData: UpdateStudentData
  ): Promise<Student | null> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ["teachers"],
    });
    if (!student) {
      return null;
    }

    // 如果更新团队，验证团队是否存在
    if (studentData.teamId && studentData.teamId !== student.teamId) {
      const team = await this.teamRepository.findOne({
        where: { id: studentData.teamId },
      });
      if (!team) {
        throw new Error("团队不存在");
      }
    }

    // 如果更新教师，验证教师是否存在
    if (studentData.teacherIds) {
      const teachers = await this.userRepository.find({
        where: { id: In(studentData.teacherIds) },
      });
      if (teachers.length !== studentData.teacherIds.length) {
        throw new Error("部分教师不存在");
      }
      student.teachers = teachers;
    }

    Object.assign(student, studentData);
    const savedStudent = await this.studentRepository.save(student);
    return await this.getStudentById(savedStudent.id);
  }

  // 删除学生
  async deleteStudent(id: number): Promise<boolean> {
    const result = await this.studentRepository.delete(id);
    return result.affected !== 0;
  }

  // 搜索学生
  async searchStudents(params: SearchParams): Promise<SearchResult> {
    const { keyword, teamId, page, limit } = params;
    const skip = (page - 1) * limit;

    let whereConditions: any = {};

    // 团队筛选
    if (teamId) {
      whereConditions.teamId = teamId;
    }

    // 关键词搜索
    if (keyword) {
      const keywordConditions = [
        { ...whereConditions, name: Like(`%${keyword}%`) },
        { ...whereConditions, remarks: Like(`%${keyword}%`) },
      ];

      const [students, total] = await this.studentRepository.findAndCount({
        where: keywordConditions,
        relations: ["team", "teachers"],
        skip,
        take: limit,
        order: { createdAt: "DESC" },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        students,
        page,
        limit,
        total,
        totalPages,
      };
    }

    // 没有关键词时的查询
    const [students, total] = await this.studentRepository.findAndCount({
      where: whereConditions,
      relations: ["team", "teachers"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      students,
      page,
      limit,
      total,
      totalPages,
    };
  }

  // 获取学生的教师列表
  async getStudentTeachers(studentId: number): Promise<User[]> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ["teachers"],
    });
    return student?.teachers || [];
  }

  // 为学生分配教师
  async assignTeachers(
    studentId: number,
    teacherIds: number[]
  ): Promise<Student | null> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ["teachers"],
    });
    if (!student) {
      return null;
    }

    const teachers = await this.userRepository.find({
      where: { id: In(teacherIds) },
    });
    if (teachers.length !== teacherIds.length) {
      throw new Error("部分教师不存在");
    }

    student.teachers = teachers;
    await this.studentRepository.save(student);
    return await this.getStudentById(studentId);
  }

  // 获取团队的学生统计
  async getTeamStudentStats(
    teamId: number
  ): Promise<{ total: number; byGender: Record<string, number> }> {
    const students = await this.studentRepository.find({
      where: { teamId },
    });

    const total = students.length;
    const byGender = students.reduce((acc, student) => {
      acc[student.gender] = (acc[student.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byGender };
  }
}
