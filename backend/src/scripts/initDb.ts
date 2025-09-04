import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { UserRole } from "../types/user";

// 加载环境变量
dotenv.config();

interface UserData {
  username: string;
  phone: string;
  password: string;
  role: UserRole;
}

const defaultUsers: UserData[] = [
  {
    username: "admin",
    phone: "13333333333",
    password: "123123",
    role: UserRole.ADMIN,
  },
];

const createUser = async (userData: UserData): Promise<void> => {
  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) {
      const shouldReset =
        (process.env.RESET_DEFAULT_USERS || "").toLowerCase() === "true";
      if (shouldReset) {
        existingUser.password = userData.password; // 交由模型 pre-save 进行哈希
        await existingUser.save();
        console.log(
          `♻️ 已重置用户 ${userData.username} (${userData.phone}) 的密码`
        );
        return;
      } else {
        console.log(
          `⚠️  用户 ${userData.username} (${userData.phone}) 已存在，跳过创建`
        );
        return;
      }
    }

    // 创建用户
    const user = new User({
      ...userData,
    });

    await user.save();
    console.log(`✅ 用户 ${userData.username} 创建成功！`);
    console.log(`   用户名: ${userData.username}`);
    console.log(`   手机号: ${userData.phone}`);
    console.log(`   密码: ${userData.password}`);
    console.log(`   角色: ${userData.role}`);
  } catch (error) {
    console.error(
      `❌ 创建用户 ${userData.username} 失败:`,
      (error as Error).message
    );
  }
};

const initializeDatabase = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/ba-system";

    // 连接数据库
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB连接成功");
    console.log("🚀 开始初始化数据库...\n");

    // 创建所有用户
    for (const userData of defaultUsers) {
      await createUser(userData);
      console.log(""); // 空行分隔
    }

    console.log("📊 数据库初始化完成！");
    console.log("📱 您可以使用以下凭据登录系统：");
    console.log("=====================================");

    defaultUsers.forEach((user) => {
      console.log(`👤 ${user.username}:`);
      console.log(`   手机号: ${user.phone}`);
      console.log(`   密码: ${user.password}`);
      console.log(
        `   角色: ${user.role === UserRole.ADMIN ? "管理员" : "普通用户"}`
      );
      console.log("");
    });

    console.log("💡 提示：");
    console.log("   - 管理员用户可以访问所有功能");
    console.log("   - 普通用户只能查看个人信息");
    console.log("   - 建议首次登录后修改默认密码");
  } catch (error) {
    console.error("❌ 初始化数据库失败:", (error as Error).message);
    process.exit(1);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
    console.log("🔌 数据库连接已断开");
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("🎉 数据库初始化脚本执行完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 脚本执行失败:", error);
      process.exit(1);
    });
}

export { initializeDatabase, createUser };
