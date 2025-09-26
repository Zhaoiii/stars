import { Request, Response } from "express";
import { CourseService } from "../services/CourseService";
import { ResponseUtil } from "../utils/response";
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryParams,
} from "../types/course";
import { CourseStatus, CourseType } from "../types/enums";

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  // 获取课程列表
  getCourses = async (req: Request, res: Response) => {
    try {
      const queryParams: CourseQueryParams = {
        page:
          parseInt(
            (req.query.page as string) || (req.query.current as string)
          ) || 1,
        // 兼容 pageSize/limit 两种参数名
        limit:
          parseInt(
            (req.query.pageSize as string) || (req.query.limit as string)
          ) || 10,
        studentId: req.query.studentId
          ? parseInt(req.query.studentId as string)
          : undefined,
        teacherId: req.query.teacherId
          ? parseInt(req.query.teacherId as string)
          : undefined,
        type: req.query.type as CourseType,
        status: req.query.status as CourseStatus,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
      };

      const result = await this.courseService.getCourses(queryParams);
      // 统一分页响应格式
      return ResponseUtil.successPaginated(
        res,
        result.courses,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        "获取课程列表成功"
      );
    } catch (error) {
      console.error("获取课程列表失败:", error);
      return ResponseUtil.error(res, "获取课程列表失败");
    }
  };

  // 获取单个课程
  getCourseById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const course = await this.courseService.getCourseById(parseInt(id));

      if (!course) {
        return res.status(404).json({ message: "课程不存在" });
      }

      res.json(course);
    } catch (error) {
      console.error("获取课程失败:", error);
      res.status(500).json({ message: "获取课程失败" });
    }
  };

  // 创建课程
  createCourse = async (req: Request, res: Response) => {
    try {
      const courseData: CreateCourseRequest = req.body;
      const course = await this.courseService.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("创建课程失败:", error);
      res.status(500).json({ message: "创建课程失败" });
    }
  };

  // 更新课程
  updateCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateCourseRequest = req.body;
      const course = await this.courseService.updateCourse(
        parseInt(id),
        updateData
      );

      if (!course) {
        return res.status(404).json({ message: "课程不存在" });
      }

      res.json(course);
    } catch (error) {
      console.error("更新课程失败:", error);
      res.status(500).json({ message: "更新课程失败" });
    }
  };

  // 删除课程
  deleteCourse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await this.courseService.deleteCourse(parseInt(id));

      if (!success) {
        return res.status(404).json({ message: "课程不存在" });
      }

      res.json({ message: "课程删除成功" });
    } catch (error) {
      console.error("删除课程失败:", error);
      res.status(500).json({ message: "删除课程失败" });
    }
  };

  // 获取课程统计
  getCourseStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.courseService.getCourseStats();
      res.json(stats);
    } catch (error) {
      console.error("获取课程统计失败:", error);
      res.status(500).json({ message: "获取课程统计失败" });
    }
  };

  // 获取日历事件
  getCalendarEvents = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, studentId, teacherId } = req.query;
      const events = await this.courseService.getCalendarEvents({
        startDate: startDate as string,
        endDate: endDate as string,
        studentId: studentId ? parseInt(studentId as string) : undefined,
        teacherId: teacherId ? parseInt(teacherId as string) : undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("获取日历事件失败:", error);
      res.status(500).json({ message: "获取日历事件失败" });
    }
  };

  // 批量创建重复课程
  createRecurringCourses = async (req: Request, res: Response) => {
    try {
      const courseData: CreateCourseRequest = req.body;
      const courses = await this.courseService.createRecurringCourses(
        courseData
      );
      res.status(201).json(courses);
    } catch (error) {
      console.error("创建重复课程失败:", error);
      res.status(500).json({ message: "创建重复课程失败" });
    }
  };
}
