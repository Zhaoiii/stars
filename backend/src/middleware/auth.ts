import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "请先登录" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      res.status(401).json({ message: "用户不存在" });
      return;
    }

    req.user = {
      _id: (user._id as any).toString(),
      username: user.username,
      phone: user.phone,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "身份验证失败" });
  }
};

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await auth(req, res, () => {});

    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: "需要管理员权限" });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "权限验证失败" });
  }
};
