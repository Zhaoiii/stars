import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { ResponseUtil } from "../utils/response";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

// JWT 认证中间件
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "访问令牌缺失",
      });
      return;
    }

    const userService = new UserService();
    const decoded = await userService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "无效的访问令牌",
    });
  }
};

// 教师或管理员权限中间件
export const requireTeacherOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.user?.role !== "admin" &&
    req.user?.role !== "manager_teacher" &&
    req.user?.role !== "teacher"
  ) {
    res.status(403).json({
      success: false,
      message: "需要教师或管理员权限",
    });
    return;
  }
  next();
};

// 管理员权限中间件
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    ResponseUtil.forbidden(res, "需要管理员权限");
    return;
  }
  next();
};

// 管理员或管理教师权限中间件
export const requireAdminOrManagerTeacher = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(req.user);
  if (req.user?.role !== "admin" && req.user?.role !== "manager_teacher") {
    ResponseUtil.forbidden(res, "需要管理员或管理教师权限");
    return;
  }
  next();
};

// 通用认证中间件（兼容旧名称）
export const authMiddleware = authenticateToken;
