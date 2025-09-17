import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { Student } from "../entities/Student";
import dotenv from "dotenv";

dotenv.config();

// 创建数据库连接（不指定数据库名，用于创建数据库）
const createDatabaseConnection = () => {
  return new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: "postgres", // 连接到默认的 postgres 数据库
    synchronize: false,
    logging: true,
  });
};

// 创建应用数据库连接
const createAppDatabaseConnection = () => {
  return new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "ba_system",
    synchronize: true, // 自动创建表结构
    logging: true,
    entities: [User, Team, Student],
  });
};

async function initDatabase() {
  const dbName = process.env.DB_DATABASE || "ba_system";
  let connection: DataSource | null = null;
  let appConnection: DataSource | null = null;

  try {
    console.log("🚀 开始初始化数据库...");
    console.log(`📊 数据库名称: ${dbName}`);
    console.log(`🔗 数据库主机: ${process.env.DB_HOST || "localhost"}`);
    console.log(`🔌 数据库端口: ${process.env.DB_PORT || "5432"}`);

    // 1. 连接到 postgres 数据库创建目标数据库
    console.log("\n1. 连接到 PostgreSQL 服务器...");
    connection = createDatabaseConnection();
    await connection.initialize();
    console.log("✅ 成功连接到 PostgreSQL 服务器");

    // 2. 检查数据库是否存在
    console.log(`\n2. 检查数据库 ${dbName} 是否存在...`);
    const result = await connection.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.length > 0) {
      console.log(`⚠️  数据库 ${dbName} 已存在`);
      console.log("🔄 将重新创建数据库...");

      // 断开所有连接到该数据库的连接
      await connection.query(
        `
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `,
        [dbName]
      );

      // 删除现有数据库
      await connection.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      console.log(`✅ 已删除现有数据库 ${dbName}`);
    }

    // 3. 创建新数据库
    console.log(`\n3. 创建数据库 ${dbName}...`);
    await connection.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ 数据库 ${dbName} 创建成功`);

    // 4. 关闭连接
    await connection.destroy();
    connection = null;

    // 5. 连接到新创建的数据库并创建表结构
    console.log(`\n4. 连接到数据库 ${dbName} 并创建表结构...`);
    appConnection = createAppDatabaseConnection();
    await appConnection.initialize();
    console.log("✅ 成功连接到应用数据库");

    // 6. 同步表结构（TypeORM 会自动创建表）
    console.log("\n5. 创建表结构...");
    await appConnection.synchronize();
    console.log("✅ 表结构创建成功");

    // 7. 显示创建的表
    console.log("\n6. 显示创建的表:");
    const tables = await appConnection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    tables.forEach((table: any) => {
      console.log(`  📋 ${table.table_name}`);
    });

    console.log("\n🎉 数据库初始化完成！");
    console.log("\n📝 下一步:");
    console.log("1. 运行 'yarn init-admin' 创建默认管理员用户");
    console.log("2. 运行 'yarn dev' 启动开发服务器");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);

    if (error instanceof Error) {
      console.error("错误详情:", error.message);

      // 提供常见错误的解决建议
      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 解决建议:");
        console.log("1. 确保 PostgreSQL 服务正在运行");
        console.log("2. 检查数据库连接配置（host, port, username, password）");
      } else if (error.message.includes("authentication failed")) {
        console.log("\n💡 解决建议:");
        console.log("1. 检查数据库用户名和密码是否正确");
        console.log("2. 确保用户有创建数据库的权限");
      } else if (error.message.includes("does not exist")) {
        console.log("\n💡 解决建议:");
        console.log("1. 确保 PostgreSQL 服务已安装并运行");
        console.log("2. 检查数据库端口是否正确");
      }
    }

    process.exit(1);
  } finally {
    // 清理连接
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
    if (appConnection && appConnection.isInitialized) {
      await appConnection.destroy();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase();
}

export default initDatabase;
