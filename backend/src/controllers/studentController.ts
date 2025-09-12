import { Request, Response } from "express";
import { Student } from "../models/Student";
import { Gender } from "../types/student";
import { UserRole } from "../types/user";
import { Group } from "../models/Group";
import { User } from "../models/User";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: UserRole;
  };
}

export const getAllStudents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;

    let filter: any = {};

    if (user.role === UserRole.ADMIN) {
      // 管理员可见全部
    } else {
      // 先查找用户作为 Group 管理者管理的组
      const managedGroups = await Group.find({ managers: user._id }).select(
        "students"
      );
      const managedStudentIds = new Set<string>();
      managedGroups.forEach((g) => {
        (g.students as any[]).forEach((sid: any) =>
          managedStudentIds.add(sid.toString())
        );
      });

      // 老师被分配的学生
      const teacherAssignedFilter = { assignedTeachers: user._id };

      if (managedStudentIds.size > 0) {
        filter = {
          $or: [
            { _id: { $in: Array.from(managedStudentIds) } },
            teacherAssignedFilter,
          ],
        };
      } else {
        filter = teacherAssignedFilter;
      }
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({
      message: "获取学生列表失败",
      error: (error as Error).message,
    });
  }
};

export const getStudentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    // 可见性校验（与列表一致）
    const user = req.user!;
    let canView = false;

    if (user.role === UserRole.ADMIN) {
      canView = true;
    } else {
      const inManagedGroup = await Group.exists({
        managers: user._id,
        students: studentId,
      });
      if (inManagedGroup) {
        canView = true;
      } else {
        const assigned = await Student.exists({
          _id: studentId,
          assignedTeachers: user._id,
        });
        canView = !!assigned;
      }
    }

    if (!canView) {
      res.status(403).json({ message: "没有权限查看该学生" });
      return;
    }

    const student = await Student.findById(studentId)
      .populate("assignedTeachers", "username phone role")
      .populate({
        path: "groups",
        select: "name teachers",
        populate: {
          path: "teachers",
          select: "username phone role",
        },
      });

    if (!student) {
      res.status(404).json({ message: "学生不存在" });
      return;
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({
      message: "获取学生信息失败",
      error: (error as Error).message,
    });
  }
};

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, gender, birthDate } = req.body;

    // 验证性别
    if (!Object.values(Gender).includes(gender)) {
      res.status(400).json({ message: "无效的性别值" });
      return;
    }

    // 验证出生日期
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      res.status(400).json({ message: "无效的出生日期" });
      return;
    }

    // 检查出生日期是否合理
    const now = new Date();
    if (birthDateObj > now) {
      res.status(400).json({ message: "出生日期不能晚于当前日期" });
      return;
    }

    // 创建学生
    const student = new Student({
      name,
      gender,
      birthDate: birthDateObj,
    });

    await student.save();

    res.status(201).json({
      message: "学生创建成功",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "创建学生失败",
      error: (error as Error).message,
    });
  }
};

export const updateStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { name, gender, birthDate } = req.body;

    // 验证性别
    if (gender && !Object.values(Gender).includes(gender)) {
      res.status(400).json({ message: "无效的性别值" });
      return;
    }

    // 验证出生日期
    let birthDateObj: Date | undefined;
    if (birthDate) {
      birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        res.status(400).json({ message: "无效的出生日期" });
        return;
      }
      if (birthDateObj > new Date()) {
        res.status(400).json({ message: "出生日期不能晚于当前日期" });
        return;
      }
    }

    // 更新学生信息
    const updateData: any = {};
    if (name) updateData.name = name;
    if (gender) updateData.gender = gender;
    if (birthDateObj) updateData.birthDate = birthDateObj;

    const student = await Student.findByIdAndUpdate(studentId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      res.status(404).json({ message: "学生不存在" });
      return;
    }

    res.json({
      message: "学生信息更新成功",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "更新学生信息失败",
      error: (error as Error).message,
    });
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      res.status(404).json({ message: "学生不存在" });
      return;
    }

    res.json({ message: "学生删除成功" });
  } catch (error) {
    res.status(500).json({
      message: "删除学生失败",
      error: (error as Error).message,
    });
  }
};

export const searchStudents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, gender, minAge, maxAge } = req.query;

    const filter: any = {};

    // 按姓名搜索
    if (name) {
      filter.name = { $regex: name as string, $options: "i" };
    }

    // 按性别筛选
    if (gender && Object.values(Gender).includes(gender as Gender)) {
      filter.gender = gender;
    }

    // 按年龄范围筛选
    if (minAge || maxAge) {
      const now = new Date();
      if (minAge) {
        const maxBirthDate = new Date(
          now.getFullYear() - parseInt(minAge as string),
          now.getMonth(),
          now.getDate()
        );
        filter.birthDate = { $lte: maxBirthDate };
      }
      if (maxAge) {
        const minBirthDate = new Date(
          now.getFullYear() - parseInt(maxAge as string) - 1,
          now.getMonth(),
          now.getDate()
        );
        if (filter.birthDate) {
          filter.birthDate.$gte = minBirthDate;
        } else {
          filter.birthDate = { $gte: minBirthDate };
        }
      }
    }

    // 权限过滤
    const user = req.user!;
    if (user.role !== UserRole.ADMIN) {
      const managedGroups = await Group.find({ managers: user._id }).select(
        "students"
      );
      const managedStudentIds = new Set<string>();
      managedGroups.forEach((g) => {
        (g.students as any[]).forEach((sid: any) =>
          managedStudentIds.add(sid.toString())
        );
      });

      const teacherAssignedFilter = { assignedTeachers: user._id };

      if (managedStudentIds.size > 0) {
        filter.$or = [
          { _id: { $in: Array.from(managedStudentIds) } },
          teacherAssignedFilter,
        ];
      } else {
        Object.assign(filter, teacherAssignedFilter);
      }
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({
      message: "搜索学生失败",
      error: (error as Error).message,
    });
  }
};

export const assignTeachersToStudent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { teacherIds = [] } = req.body as { teacherIds: string[] };

    // 基本存在性校验
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "学生不存在" });
      return;
    }
    const usersCount = await User.countDocuments({ _id: { $in: teacherIds } });
    if (usersCount !== teacherIds.length) {
      res.status(400).json({ message: "部分教师不存在" });
      return;
    }

    // 权限：管理员 或 该学生所在任一组的组管理者
    const user = req.user!;
    if (user.role !== UserRole.ADMIN) {
      const isGroupManager = await Group.exists({
        managers: user._id,
        students: studentId,
      });
      if (!isGroupManager) {
        res.status(403).json({ message: "没有权限分配该学生的教师" });
        return;
      }
    }

    await Student.updateOne(
      { _id: studentId },
      { $addToSet: { assignedTeachers: { $each: teacherIds } } }
    );

    const updated = await Student.findById(studentId);
    res.json({ message: "分配成功", student: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "分配教师失败", error: (error as Error).message });
  }
};

export const unassignTeachersFromStudent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { teacherIds = [] } = req.body as { teacherIds: string[] };

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "学生不存在" });
      return;
    }

    const user = req.user!;
    if (user.role !== UserRole.ADMIN) {
      const isGroupManager = await Group.exists({
        managers: user._id,
        students: studentId,
      });
      if (!isGroupManager) {
        res.status(403).json({ message: "没有权限取消分配该学生的教师" });
        return;
      }
    }

    await Student.updateOne(
      { _id: studentId },
      { $pull: { assignedTeachers: { $in: teacherIds } } }
    );

    const updated = await Student.findById(studentId);
    res.json({ message: "取消分配成功", student: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "取消分配失败", error: (error as Error).message });
  }
};
