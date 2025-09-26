import "reflect-metadata";
import { initializeDatabase } from "../config/database";
import { Course } from "../entities/Course";

const createCourseTable = async () => {
  try {
    console.log("正在连接数据库...");
    const dataSource = await initializeDatabase();

    console.log("正在创建课程表...");
    await dataSource.synchronize();

    console.log("✅ 课程表创建成功！");

    // 关闭数据库连接
    await dataSource.destroy();
    console.log("数据库连接已关闭");
  } catch (error) {
    console.error("❌ 创建课程表失败:", error);
    process.exit(1);
  }
};

createCourseTable();
