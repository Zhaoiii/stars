import { Course } from "../entities/Course";
import { Student } from "../entities/Student";
import { User } from "../entities/User";
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryParams,
  CourseStats,
  CalendarEvent,
} from "../types/course";
import { CourseStatus, CourseType, RepeatMode } from "../types/enums";

export class CourseService {
  // 获取课程列表
  async getCourses(queryParams: CourseQueryParams) {
    const {
      page = 1,
      limit = 10,
      studentId,
      teacherId,
      type,
      status,
      startDate,
      endDate,
      search,
    } = queryParams;

    const query = Course.createQueryBuilder("course")
      .leftJoinAndSelect("course.student", "student")
      .leftJoinAndSelect("course.teacher", "teacher")
      .orderBy("course.startTime", "ASC");

    // 添加过滤条件
    if (studentId) {
      query.andWhere("course.studentId = :studentId", { studentId });
    }

    if (teacherId) {
      query.andWhere("course.teacherId = :teacherId", { teacherId });
    }

    if (type) {
      query.andWhere("course.type = :type", { type });
    }

    if (status) {
      query.andWhere("course.status = :status", { status });
    }

    if (startDate) {
      query.andWhere("course.startTime >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("course.endTime <= :endDate", { endDate });
    }

    if (search) {
      query.andWhere(
        "(course.title ILIKE :search OR course.description ILIKE :search OR student.name ILIKE :search OR teacher.name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // 分页
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [courses, total] = await query.getManyAndCount();

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 获取单个课程
  async getCourseById(id: number) {
    return await Course.findOne({
      where: { id },
      relations: ["student", "teacher"],
    });
  }

  // 创建课程
  async createCourse(courseData: CreateCourseRequest) {
    // 验证学生和教师是否存在
    const student = await Student.findOne({
      where: { id: courseData.studentId },
    });
    if (!student) {
      throw new Error("学生不存在");
    }

    const teacher = await User.findOne({ where: { id: courseData.teacherId } });
    if (!teacher) {
      throw new Error("教师不存在");
    }

    // 验证教师是否被分配给该学生
    const isTeacherAssigned = await Student.createQueryBuilder("student")
      .leftJoin("student.teachers", "teacher")
      .where("student.id = :studentId", { studentId: courseData.studentId })
      .andWhere("teacher.id = :teacherId", { teacherId: courseData.teacherId })
      .getOne();

    if (!isTeacherAssigned) {
      throw new Error("该教师未被分配给该学生");
    }

    // 自动生成课程名
    const courseTypeText = courseData.type === "evaluation" ? "评估" : "个训";
    const startTime = new Date(courseData.startTime);
    const timeStr = startTime.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const autoTitle = `${student.name} - ${courseTypeText} - ${timeStr}`;

    const course = Course.create({
      ...courseData,
      title: autoTitle,
    });
    return await course.save();
  }

  // 更新课程
  async updateCourse(id: number, updateData: UpdateCourseRequest) {
    const course = await Course.findOne({ where: { id } });
    if (!course) {
      return null;
    }

    // 如果更新学生或教师，需要验证关系
    if (updateData.studentId || updateData.teacherId) {
      const studentId = updateData.studentId || course.studentId;
      const teacherId = updateData.teacherId || course.teacherId;

      const isTeacherAssigned = await Student.createQueryBuilder("student")
        .leftJoin("student.teachers", "teacher")
        .where("student.id = :studentId", { studentId })
        .andWhere("teacher.id = :teacherId", { teacherId })
        .getOne();

      if (!isTeacherAssigned) {
        throw new Error("该教师未被分配给该学生");
      }
    }

    Object.assign(course, updateData);
    return await course.save();
  }

  // 删除课程
  async deleteCourse(id: number) {
    const result = await Course.delete(id);
    return (result.affected || 0) > 0;
  }

  // 获取课程统计
  async getCourseStats(): Promise<CourseStats> {
    const total = await Course.count();
    const scheduled = await Course.count({
      where: { status: CourseStatus.SCHEDULED },
    });
    const inProgress = await Course.count({
      where: { status: CourseStatus.IN_PROGRESS },
    });
    const completed = await Course.count({
      where: { status: CourseStatus.COMPLETED },
    });
    const cancelled = await Course.count({
      where: { status: CourseStatus.CANCELLED },
    });

    const evaluationCount = await Course.count({
      where: { type: CourseType.EVALUATION },
    });
    const individualTrainingCount = await Course.count({
      where: { type: CourseType.INDIVIDUAL_TRAINING },
    });

    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      byType: {
        evaluation: evaluationCount,
        individual_training: individualTrainingCount,
      },
    };
  }

  // 获取日历事件
  async getCalendarEvents(params: {
    startDate?: string;
    endDate?: string;
    studentId?: number;
    teacherId?: number;
  }): Promise<CalendarEvent[]> {
    const { startDate, endDate, studentId, teacherId } = params;

    const query = Course.createQueryBuilder("course")
      .leftJoinAndSelect("course.student", "student")
      .leftJoinAndSelect("course.teacher", "teacher")
      .orderBy("course.startTime", "ASC");

    if (startDate) {
      query.andWhere("course.startTime >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("course.endTime <= :endDate", { endDate });
    }

    if (studentId) {
      query.andWhere("course.studentId = :studentId", { studentId });
    }

    if (teacherId) {
      query.andWhere("course.teacherId = :teacherId", { teacherId });
    }

    const courses = await query.getMany();

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      start: new Date(course.startTime),
      end: new Date(course.endTime),
      type: course.type,
      status: course.status,
      studentId: course.studentId,
      teacherId: course.teacherId,
      studentName: course.student?.name || "",
      teacherName: course.teacher?.name || course.teacher?.username || "",
      location: course.location,
      color: this.getCourseTypeColor(course.type),
    }));
  }

  // 创建重复课程
  async createRecurringCourses(courseData: CreateCourseRequest) {
    if (courseData.repeatMode === RepeatMode.NONE) {
      return [await this.createCourse(courseData)];
    }

    const courses = [];
    const startDate = new Date(courseData.startTime);
    const endDate = courseData.repeatEndDate
      ? new Date(courseData.repeatEndDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 默认30天后结束
    const duration =
      new Date(courseData.endTime).getTime() - startDate.getTime();

    let currentDate = new Date(startDate);
    let courseCount = 0;
    const maxCourses = 100; // 防止无限循环

    console.log(
      `开始创建重复课程: ${
        courseData.repeatMode
      }, 从 ${startDate.toISOString()} 到 ${endDate.toISOString()}`
    );

    while (currentDate <= endDate && courseCount < maxCourses) {
      const courseStartTime = new Date(currentDate);
      const courseEndTime = new Date(currentDate.getTime() + duration);

      const recurringCourseData = {
        ...courseData,
        startTime: courseStartTime.toISOString(),
        endTime: courseEndTime.toISOString(),
        repeatMode: RepeatMode.NONE, // 重复课程本身不再重复
      };

      try {
        const course = await this.createCourse(recurringCourseData);
        courses.push(course);
        courseCount++;
        console.log(
          `创建重复课程成功: ${course.title} - ${courseStartTime.toISOString()}`
        );
      } catch (error) {
        console.error(
          `创建重复课程失败 (${courseStartTime.toISOString()}):`,
          error
        );
      }

      // 计算下一个重复日期
      switch (courseData.repeatMode) {
        case RepeatMode.DAILY:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case RepeatMode.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case RepeatMode.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    console.log(`重复课程创建完成，共创建 ${courses.length} 个课程`);
    return courses;
  }

  // 获取课程类型颜色
  private getCourseTypeColor(type: string): string {
    const colors = {
      evaluation: "#1890ff",
      individual_training: "#52c41a",
    };
    return colors[type as keyof typeof colors] || "#d9d9d9";
  }
}
