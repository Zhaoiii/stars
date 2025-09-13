import { Request, Response } from "express";
import { Group } from "../models/Group";
import { User } from "../models/User";
import { Student } from "../models/Student";

export const getAllGroups = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const groups = await Group.find({})
      .populate("teachers", "username phone role")
      .populate("managers", "username phone role")
      .populate("students", "name gender birthDate");
    res.json({ groups });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取分组失败", error: (error as Error).message });
  }
};

export const getGroupById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate("teachers", "username phone role")
      .populate("managers", "username phone role")
      .populate("students", "name gender birthDate");

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    res.json({ group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取分组失败", error: (error as Error).message });
  }
};

export const createGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      teachers = [],
      managers = [],
      students = [],
    } = req.body;

    // 校验 managers 是 teachers 子集
    const teacherSet = new Set(teachers.map((t: string) => t.toString()));
    const invalidManagers = (managers as string[]).filter(
      (m) => !teacherSet.has(m.toString())
    );
    if (invalidManagers.length > 0) {
      res.status(400).json({ message: "管理者必须是教师的子集" });
      return;
    }

    // 校验用户与学生是否存在
    const usersCount = await User.countDocuments({ _id: { $in: teachers } });
    if (usersCount !== teachers.length) {
      res.status(400).json({ message: "部分教师不存在" });
      return;
    }
    const managersCount = await User.countDocuments({ _id: { $in: managers } });
    if (managersCount !== managers.length) {
      res.status(400).json({ message: "部分管理者不存在" });
      return;
    }
    const studentsCount = await Student.countDocuments({
      _id: { $in: students },
    });
    if (studentsCount !== students.length) {
      res.status(400).json({ message: "部分学生不存在" });
      return;
    }

    const group = await Group.create({
      name,
      description,
      teachers,
      managers,
      students,
    });
    res.status(201).json({ message: "分组创建成功", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建分组失败", error: (error as Error).message });
  }
};

export const updateGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { name, description, teachers, managers, students } = req.body;

    // 如果提供了 managers/teachers，需要校验子集关系
    if (teachers && managers) {
      const teacherSet = new Set(
        (teachers as string[]).map((t) => t.toString())
      );
      const invalidManagers = (managers as string[]).filter(
        (m) => !teacherSet.has(m.toString())
      );
      if (invalidManagers.length > 0) {
        res.status(400).json({ message: "管理者必须是教师的子集" });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (teachers !== undefined) updateData.teachers = teachers;
    if (managers !== undefined) updateData.managers = managers;
    if (students !== undefined) updateData.students = students;

    const group = await Group.findByIdAndUpdate(groupId, updateData, {
      new: true,
    })
      .populate("teachers", "username phone role")
      .populate("managers", "username phone role")
      .populate("students", "name gender birthDate");

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    res.json({ message: "分组更新成功", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新分组失败", error: (error as Error).message });
  }
};

export const deleteGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }
    res.json({ message: "分组已删除" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除分组失败", error: (error as Error).message });
  }
};

// 成员管理
export const addTeachersToGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { teacherIds = [] } = req.body as { teacherIds: string[] };

    const usersCount = await User.countDocuments({ _id: { $in: teacherIds } });
    if (usersCount !== teacherIds.length) {
      res.status(400).json({ message: "部分教师不存在" });
      return;
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { teachers: { $each: teacherIds } } },
      { new: true }
    );

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    res.json({ message: "教师已添加", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "添加教师失败", error: (error as Error).message });
  }
};

export const setGroupManagers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { managerIds = [] } = req.body as { managerIds: string[] };

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    // managers 必须是 teachers 子集
    const teacherSet = new Set(group.teachers.map((t: any) => t.toString()));
    const invalidManagers = managerIds.filter(
      (m) => !teacherSet.has(m.toString())
    );
    if (invalidManagers.length > 0) {
      res.status(400).json({ message: "管理者必须先成为该组教师" });
      return;
    }

    group.managers = managerIds as any;
    await group.save();

    res.json({ message: "管理者已更新", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新管理者失败", error: (error as Error).message });
  }
};

export const addStudentsToGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { studentIds = [] } = req.body as { studentIds: string[] };

    const studentsCount = await Student.countDocuments({
      _id: { $in: studentIds },
    });
    if (studentsCount !== studentIds.length) {
      res.status(400).json({ message: "部分学生不存在" });
      return;
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    // 同时更新学生的 groups 字段
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { groups: groupId } }
    );

    res.json({ message: "学生已添加", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "添加学生失败", error: (error as Error).message });
  }
};

export const removeStudentsFromGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { studentIds = [] } = req.body as { studentIds: string[] };

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { students: { $in: studentIds } } },
      { new: true }
    );

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    // 同时更新学生的 groups 字段
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $pull: { groups: groupId } }
    );

    res.json({ message: "学生已移除", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "移除学生失败", error: (error as Error).message });
  }
};

// 获取指定分组的老师列表
export const getGroupTeachers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId)
      .populate("teachers", "username phone role email");

    if (!group) {
      res.status(404).json({ message: "分组不存在" });
      return;
    }

    res.json({ 
      message: "获取老师列表成功", 
      teachers: group.teachers 
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取老师列表失败", error: (error as Error).message });
  }
};
