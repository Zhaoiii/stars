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
    synchronize: false,
    logging: false,
    entities: [User],
  });
};

async function checkDatabase() {
  const dbName = process.env.DB_DATABASE || "ba_system";
  let connection: DataSource | null = null;

  try {
    console.log("🔍 检查数据库状态...");
    console.log(`📊 数据库名称: ${dbName}`);
    console.log(`🔗 数据库主机: ${process.env.DB_HOST || "localhost"}`);
    console.log(`🔌 数据库端口: ${process.env.DB_PORT || "5432"}`);
    console.log(`👤 数据库用户: ${process.env.DB_USERNAME || "postgres"}`);

    // 1. 测试数据库连接
    console.log("\n1. 测试数据库连接...");
    connection = createAppDatabaseConnection();
    await connection.initialize();
    console.log("✅ 数据库连接成功");

    // 2. 检查数据库版本
    console.log("\n2. 检查数据库版本...");
    const version = await connection.query("SELECT version()");
    console.log(
      `📋 PostgreSQL 版本: ${version[0].version.split(" ")[0]} ${
        version[0].version.split(" ")[1]
      }`
    );

    // 3. 检查数据库大小
    console.log("\n3. 检查数据库大小...");
    const dbSize = await connection.query(
      `
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `,
      [dbName]
    );
    console.log(`💾 数据库大小: ${dbSize[0].size}`);

    // 4. 检查表结构
    console.log("\n4. 检查表结构...");
    const tables = await connection.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tables.length > 0) {
      console.log("📋 数据库表:");
      tables.forEach((table: any) => {
        console.log(`  📄 ${table.table_name} (${table.column_count} 列)`);
      });
    } else {
      console.log("⚠️  数据库中没有表");
    }

    // 5. 检查用户表数据
    console.log("\n5. 检查用户数据...");
    try {
      const userCount = await connection.query(
        "SELECT COUNT(*) as count FROM users"
      );
      console.log(`👥 用户总数: ${userCount[0].count}`);

      if (userCount[0].count > 0) {
        const adminCount = await connection.query(`
          SELECT COUNT(*) as count FROM users WHERE role = 'admin'
        `);
        const teacherCount = await connection.query(`
          SELECT COUNT(*) as count FROM users WHERE role = 'teacher'
        `);
        console.log(`  🔑 管理员: ${adminCount[0].count}`);
        console.log(`  👨‍🏫 教师: ${teacherCount[0].count}`);
      }
    } catch (error) {
      console.log("⚠️  用户表不存在或无法访问");
    }

    // 6. 检查数据库连接数
    console.log("\n6. 检查数据库连接状态...");
    const connections = await connection.query(
      `
      SELECT 
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections,
        COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = $1
    `,
      [dbName]
    );

    const conn = connections[0];
    console.log(`🔌 总连接数: ${conn.total_connections}`);
    console.log(`🟢 活跃连接: ${conn.active_connections}`);
    console.log(`🟡 空闲连接: ${conn.idle_connections}`);

    console.log("\n✅ 数据库状态检查完成！");
  } catch (error) {
    console.error("❌ 数据库状态检查失败:", error);

    if (error instanceof Error) {
      console.error("错误详情:", error.message);

      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 解决建议:");
        console.log("1. 确保 PostgreSQL 服务正在运行");
        console.log("2. 检查数据库连接配置");
        console.log("3. 确保数据库已存在（运行 'yarn init-db' 创建数据库）");
      } else if (error.message.includes("authentication failed")) {
        console.log("\n💡 解决建议:");
        console.log("1. 检查数据库用户名和密码是否正确");
        console.log("2. 确保用户有访问数据库的权限");
      } else if (error.message.includes("does not exist")) {
        console.log("\n💡 解决建议:");
        console.log("1. 数据库不存在，请运行 'yarn init-db' 创建数据库");
        console.log("2. 检查数据库名称配置");
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
  checkDatabase();
}

export default checkDatabase;


