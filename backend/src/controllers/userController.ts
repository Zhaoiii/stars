import { Request, Response } from "express";
import { User } from "../models/User";
import { UserRole } from "../types/user";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
    phone: string;
    role: UserRole;
  };
}

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "未授权" });
      return;
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取用户信息失败", error: (error as Error).message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取用户列表失败", error: (error as Error).message });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, phone, password, role } = req.body;

    // 检查手机号是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(400).json({ message: "手机号已存在" });
      return;
    }

    // 创建新用户
    const user = new User({
      username,
      phone,
      password,
      role: role || UserRole.USER,
    });

    await user.save();

    // 返回用户信息（不包含密码）
    const userResponse = await User.findById(user._id).select("-password");
    res.status(201).json({
      message: "用户创建成功",
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建用户失败", error: (error as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取用户信息失败", error: (error as Error).message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username, phone, role } = req.body;

    // 检查手机号是否已被其他用户使用
    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ message: "手机号已被其他用户使用" });
        return;
      }
    }

    // 更新用户信息
    const updateData: any = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (role && Object.values(UserRole).includes(role)) updateData.role = role;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ message: "用户信息更新成功", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新用户信息失败", error: (error as Error).message });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: "无效的用户角色" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ message: "用户角色更新成功", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新用户角色失败", error: (error as Error).message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ message: "用户删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除用户失败", error: (error as Error).message });
  }
};
