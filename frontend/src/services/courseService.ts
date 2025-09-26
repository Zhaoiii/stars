import api, { PaginatedResponse } from "./api";
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryParams,
  CourseStats,
  CalendarEvent,
  Course,
} from "../types/course";

export const courseService = {
  // 获取课程列表
  getCourses: async (params: CourseQueryParams = {}) => {
    // 统一分页参数命名：使用 current/pageSize
    const { page, limit, ...rest } = params;
    const query = {
      current: page ?? undefined,
      pageSize: limit ?? undefined,
      ...rest,
    };
    const response = await api.get<PaginatedResponse<Course>>("/courses", {
      params: query,
    });
    return response.data; // 包含 success, data, page, pageSize, total
  },

  // 获取单个课程
  getCourseById: async (id: number) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // 创建课程
  createCourse: async (courseData: CreateCourseRequest) => {
    const response = await api.post("/courses", courseData);
    return response.data;
  },

  // 更新课程
  updateCourse: async (id: number, courseData: UpdateCourseRequest) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // 删除课程
  deleteCourse: async (id: number) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // 获取课程统计
  getCourseStats: async (): Promise<CourseStats> => {
    const response = await api.get("/courses/stats");
    return response.data;
  },

  // 获取日历事件
  getCalendarEvents: async (params: {
    startDate?: string;
    endDate?: string;
    studentId?: number;
    teacherId?: number;
  }): Promise<CalendarEvent[]> => {
    const response = await api.get("/courses/calendar", { params });
    return response.data;
  },

  // 创建重复课程
  createRecurringCourses: async (courseData: CreateCourseRequest) => {
    const response = await api.post("/courses/recurring", courseData);
    return response.data;
  },
};
