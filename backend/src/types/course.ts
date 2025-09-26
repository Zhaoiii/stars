import { CourseType, CourseStatus, RepeatMode } from "./enums";

// 课程基础信息
export interface Course {
  id: number;
  title: string;
  description?: string;
  type: CourseType;
  status: CourseStatus;
  startTime: string;
  endTime: string;
  location?: string;
  repeatMode: RepeatMode;
  repeatEndDate?: string;
  notes?: string;
  studentId: number;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
    username: string;
  };
}

// 创建课程请求
export interface CreateCourseRequest {
  title: string;
  description?: string;
  type: CourseType;
  startTime: string;
  endTime: string;
  location?: string;
  repeatMode: RepeatMode;
  repeatEndDate?: string;
  notes?: string;
  studentId: number;
  teacherId: number;
}

// 更新课程请求
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  type?: CourseType;
  status?: CourseStatus;
  startTime?: string;
  endTime?: string;
  location?: string;
  repeatMode?: RepeatMode;
  repeatEndDate?: string;
  notes?: string;
  studentId?: number;
  teacherId?: number;
}

// 课程查询参数
export interface CourseQueryParams {
  page?: number;
  limit?: number;
  studentId?: number;
  teacherId?: number;
  type?: CourseType;
  status?: CourseStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// 课程统计信息
export interface CourseStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: {
    [key in CourseType]: number;
  };
}

// 日历事件
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: CourseType;
  status: CourseStatus;
  studentName: string;
  teacherName: string;
  location?: string;
  color?: string;
}
