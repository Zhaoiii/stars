import { Request, Response } from "express";
import {
  StudentService,
  CreateStudentData,
  UpdateStudentData,
} from "../services/StudentService";
import { ResponseUtil } from "../utils/response";
import {
  CreateStudentInput,
  UpdateStudentInput,
  SearchStudentsInput,
} from "../schemas/studentSchemas";

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  // 创建学生
  createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const studentData: CreateStudentInput = req.body;
      const student = await this.studentService.createStudent(
        studentData as CreateStudentData
      );

      ResponseUtil.success(res, student, "学生创建成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建学生失败",
        400
      );
    }
  };

  // 搜索学生
  searchStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchParams: SearchStudentsInput =
        req.query as unknown as SearchStudentsInput;

      const result = await this.studentService.searchStudents({
        keyword: searchParams.keyword,
        teamId: searchParams.teamId,
        page: searchParams.page,
        limit: searchParams.pageSize,
      });

      ResponseUtil.successPaginated(
        res,
        result.students,
        result.page,
        result.limit,
        result.total,
        "搜索学生成功"
      );
    } catch (error) {
      ResponseUtil.error(res, "搜索学生失败");
    }
  };

  // 根据ID获取学生
  getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const student = await this.studentService.getStudentById(id);

      if (!student) {
        ResponseUtil.notFound(res, "学生不存在");
        return;
      }

      ResponseUtil.success(res, student, "获取学生信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取学生信息失败");
    }
  };

  // 更新学生
  updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const studentData: UpdateStudentInput = req.body;

      const student = await this.studentService.updateStudent(
        id,
        studentData as UpdateStudentData
      );

      if (!student) {
        ResponseUtil.notFound(res, "学生不存在");
        return;
      }

      ResponseUtil.success(res, student, "学生更新成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新学生失败",
        400
      );
    }
  };

  // 删除学生
  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const success = await this.studentService.deleteStudent(id);

      if (!success) {
        ResponseUtil.notFound(res, "学生不存在");
        return;
      }

      ResponseUtil.success(res, null, "学生删除成功");
    } catch (error) {
      ResponseUtil.error(res, "删除学生失败");
    }
  };

  // 获取学生的教师列表
  getStudentTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const teachers = await this.studentService.getStudentTeachers(id);

      ResponseUtil.success(res, teachers, "获取学生教师列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取学生教师列表失败");
    }
  };

  // 为学生分配教师
  assignTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { teacherIds } = req.body;

      if (!Array.isArray(teacherIds)) {
        ResponseUtil.error(res, "教师ID列表格式错误", 400);
        return;
      }

      const student = await this.studentService.assignTeachers(id, teacherIds);

      if (!student) {
        ResponseUtil.notFound(res, "学生不存在");
        return;
      }

      ResponseUtil.success(res, student, "教师分配成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "教师分配失败",
        400
      );
    }
  };

  // 获取团队学生统计
  getTeamStudentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const stats = await this.studentService.getTeamStudentStats(teamId);

      ResponseUtil.success(res, stats, "获取团队学生统计成功");
    } catch (error) {
      ResponseUtil.error(res, "获取团队学生统计失败");
    }
  };
}
