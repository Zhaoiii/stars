import { Repository, Like, Or } from "typeorm";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "../types/enums";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  teamId?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  teamId?: number;
}

export interface SearchParams {
  keyword?: string;
  role?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface SearchResult {
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  // 创建用户
  async createUser(userData: CreateUserData): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      throw new Error("用户名或邮箱已存在");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  // 获取所有用户
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        "id",
        "username",
        "email",
        "name",
        "role",
        "status",
        "phone",
        "avatar",
        "teamId",
        "createdAt",
        "updatedAt",
      ],
      relations: ["team"],
    });
  }

  // 根据ID获取用户
  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "username",
        "email",
        "name",
        "role",
        "status",
        "phone",
        "avatar",
        "teamId",
        "createdAt",
        "updatedAt",
      ],
      relations: ["team"],
    });
  }

  // 根据用户名获取用户（包含密码，用于登录验证）
  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  // 更新用户
  async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    // 如果更新用户名或邮箱，检查是否已存在
    if (userData.username || userData.email) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: userData.username || user.username },
          { email: userData.email || user.email },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new Error("用户名或邮箱已存在");
      }
    }

    Object.assign(user, userData);
    return await this.userRepository.save(user);
  }

  // 删除用户
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }

  // 用户登录
  async login(
    loginData: LoginData
  ): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.getUserByUsername(loginData.username);

    if (!user) {
      throw new Error("用户名或密码错误");
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("用户名或密码错误");
    }

    if (user.status !== "active") {
      throw new Error("账户已被禁用");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" } as jwt.SignOptions
    );

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // 搜索用户
  async searchUsers(params: SearchParams): Promise<SearchResult> {
    const { keyword, role, status, page, limit } = params;
    const skip = (page - 1) * limit;

    // 构建查询条件
    let whereConditions: any = {};

    // 角色筛选
    if (role) {
      whereConditions.role = role;
    }

    // 状态筛选
    if (status) {
      whereConditions.status = status;
    }

    // 关键词搜索 - 需要构建 OR 条件
    if (keyword) {
      const keywordConditions = [
        { ...whereConditions, username: Like(`%${keyword}%`) },
        { ...whereConditions, email: Like(`%${keyword}%`) },
        { ...whereConditions, name: Like(`%${keyword}%`) },
        { ...whereConditions, phone: Like(`%${keyword}%`) },
      ];

      // 执行查询
      const [users, total] = await this.userRepository.findAndCount({
        where: keywordConditions,
        select: [
          "id",
          "username",
          "email",
          "name",
          "role",
          "status",
          "phone",
          "avatar",
          "teamId",
          "createdAt",
          "updatedAt",
        ],
        relations: ["team"],
        skip,
        take: limit,
        order: { createdAt: "DESC" },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        page,
        limit,
        total,
        totalPages,
      };
    }

    // 没有关键词时的查询
    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      select: [
        "id",
        "username",
        "email",
        "name",
        "role",
        "status",
        "phone",
        "avatar",
        "teamId",
        "createdAt",
        "updatedAt",
      ],
      relations: ["team"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      page,
      limit,
      total,
      totalPages,
    };
  }

  // 验证JWT token
  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "default-secret");
    } catch (error) {
      throw new Error("无效的token");
    }
  }
}
