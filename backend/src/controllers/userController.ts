import { Request, Response } from "express";
import {
  UserService,
  CreateUserData,
  UpdateUserData,
  LoginData,
} from "../services/UserService";
import { ResponseUtil } from "../utils/response";
import {
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  SearchUsersInput,
} from "../schemas/userSchemas";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // 创建用户
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserInput = req.body;
      const user = await this.userService.createUser(
        userData as CreateUserData
      );

      ResponseUtil.success(res, user, "用户创建成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建用户失败",
        400
      );
    }
  };

  // 获取所有用户
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      ResponseUtil.success(res, users, "获取用户列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取用户列表失败");
    }
  };

  // 搜索用户
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchParams: SearchUsersInput =
        req.query as unknown as SearchUsersInput;

      const result = await this.userService.searchUsers({
        keyword: searchParams.keyword,
        role: searchParams.role,
        status: searchParams.status,
        page: searchParams.page,
        limit: searchParams.pageSize,
      });

      ResponseUtil.successPaginated(
        res,
        result.users,
        result.page,
        result.limit,
        result.total,
        "搜索用户成功"
      );
    } catch (error) {
      ResponseUtil.error(res, "搜索用户失败");
    }
  };

  // 根据ID获取用户
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.getUserById(id);

      if (!user) {
        ResponseUtil.notFound(res, "用户不存在");
        return;
      }

      ResponseUtil.success(res, user, "获取用户信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取用户信息失败");
    }
  };

  // 更新用户
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userData: UpdateUserInput = req.body;

      const user = await this.userService.updateUser(
        id,
        userData as UpdateUserData
      );

      if (!user) {
        ResponseUtil.notFound(res, "用户不存在");
        return;
      }

      ResponseUtil.success(res, user, "用户更新成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新用户失败",
        400
      );
    }
  };

  // 删除用户
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const success = await this.userService.deleteUser(id);

      if (!success) {
        ResponseUtil.notFound(res, "用户不存在");
        return;
      }

      ResponseUtil.success(res, null, "用户删除成功");
    } catch (error) {
      ResponseUtil.error(res, "删除用户失败");
    }
  };

  // 用户登录
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginInput = req.body;
      const result = await this.userService.login(loginData as LoginData);

      ResponseUtil.success(
        res,
        {
          user: result.user,
          token: result.token,
        },
        "登录成功"
      );
    } catch (error) {
      ResponseUtil.unauthorized(
        res,
        error instanceof Error ? error.message : "登录失败"
      );
    }
  };

  // 获取当前用户信息
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        ResponseUtil.notFound(res, "用户不存在");
        return;
      }

      ResponseUtil.success(res, user, "获取用户信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取用户信息失败");
    }
  };
}
