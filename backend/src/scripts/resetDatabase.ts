import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

// 创建应用数据库连接
const createAppDatabaseConnection = () => {
  return new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "ba_system",
    synchronize: true, // 自动同步表结构
    logging: true,
    entities: [User],
  });
};

async function resetDatabase() {
  const dbName = process.env.DB_DATABASE || "ba_system";
  let connection: DataSource | null = null;

  try {
    console.log("🔄 开始重置数据库...");
    console.log(`📊 数据库名称: ${dbName}`);

    // 1. 连接到应用数据库
    console.log("\n1. 连接到数据库...");
    connection = createAppDatabaseConnection();
    await connection.initialize();
    console.log("✅ 成功连接到数据库");

    // 2. 删除所有表
    console.log("\n2. 删除现有表...");
    await connection.query("DROP SCHEMA public CASCADE");
    await connection.query("CREATE SCHEMA public");
    console.log("✅ 现有表已删除");

    // 3. 重新创建表结构
    console.log("\n3. 重新创建表结构...");
    await connection.synchronize();
    console.log("✅ 表结构重新创建成功");

    // 4. 显示创建的表
    console.log("\n4. 显示创建的表:");
    const tables = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    tables.forEach((table: any) => {
      console.log(`  📋 ${table.table_name}`);
    });

    console.log("\n🎉 数据库重置完成！");
    console.log("\n📝 下一步:");
    console.log("1. 运行 'yarn init-admin' 创建默认管理员用户");
    console.log("2. 运行 'yarn dev' 启动开发服务器");
  } catch (error) {
    console.error("❌ 数据库重置失败:", error);

    if (error instanceof Error) {
      console.error("错误详情:", error.message);

      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 解决建议:");
        console.log("1. 确保 PostgreSQL 服务正在运行");
        console.log("2. 检查数据库连接配置");
        console.log("3. 确保数据库已存在（运行 'yarn init-db' 创建数据库）");
      }
    }

    process.exit(1);
  } finally {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  resetDatabase();
}

export default resetDatabase;


