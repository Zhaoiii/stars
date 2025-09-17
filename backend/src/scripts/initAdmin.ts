import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { UserService } from "../services/UserService";
import { UserRole } from "../types/enums";
import dotenv from "dotenv";

dotenv.config();

async function initAdmin() {
  try {
    // 初始化数据库连接
    await AppDataSource.initialize();
    console.log("数据库连接成功");

    const userService = new UserService();

    // 检查是否已存在管理员用户
    const existingAdmin = await userService.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("管理员用户已存在");
      return;
    }

    // 创建默认管理员用户
    const adminData = {
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      firstName: "系统",
      lastName: "管理员",
      role: UserRole.ADMIN,
      phone: "13800138000",
    };

    const admin = await userService.createUser(adminData);
    console.log("✅ 默认管理员用户创建成功:");
    console.log("用户名: admin");
    console.log("密码: admin123");
    console.log("邮箱:", admin.email);
  } catch (error) {
    console.error("❌ 初始化失败:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initAdmin();
}

export default initAdmin;
