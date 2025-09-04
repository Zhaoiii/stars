import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { IUserInput, ILoginInput } from "../types/user";
import { auth } from "../middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, phone, password }: IUserInput = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(400).json({ message: "手机号已存在" });
      return;
    }

    const user = new User({ username, phone, password });
    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "注册成功",
      token,
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "注册失败", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password }: ILoginInput = req.body;

    console.log(phone, password);

    const user = await User.findOne({ phone });
    console.log(user);
    if (!user) {
      res.status(400).json({ message: "手机号或密码错误" });
      return;
    }

    const isMatch = await user.comparePassword(password);

    console.log(isMatch);
    if (!isMatch) {
      res.status(400).json({ message: "手机号或密码错误" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "登录成功",
      token,
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "登录失败", error: (error as Error).message });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取用户信息失败", error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 在实际应用中，这里可以将token加入黑名单
    // 目前只是返回成功消息
    res.json({
      success: true,
      message: "登出成功",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "登出失败", error: (error as Error).message });
  }
};
