// 课程类型
export enum CourseType {
  EVALUATION = "evaluation",
  INDIVIDUAL_TRAINING = "individual_training",
}

// 课程状态
export enum CourseStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// 重复模式
export enum RepeatMode {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

// 课程基础信息
export interface Course {
  id: number;
  title?: string;
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
  title?: string;
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
  title?: string;
  start: Date;
  end: Date;
  type: CourseType;
  status: CourseStatus;
  studentId: number;
  teacherId: number;
  studentName: string;
  teacherName: string;
  location?: string;
  color?: string;
}

// 课程类型配置
export interface CourseTypeConfig {
  type: CourseType;
  label: string;
  color: string;
  icon: string;
}

// 课程状态配置
export interface CourseStatusConfig {
  status: CourseStatus;
  label: string;
  color: string;
  icon: string;
}
