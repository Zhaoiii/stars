import { Request, Response } from "express";
import { Student } from "../models/Student";
import { Gender } from "../types/student";

export const getAllStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({
      message: "获取学生列表失败",
      error: (error as Error).message,
    });
  }
};

export const getStudentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

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
  req: Request,
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

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({
      message: "搜索学生失败",
      error: (error as Error).message,
    });
  }
};
