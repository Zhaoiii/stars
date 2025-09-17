import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

// 创建应用数据库连接（生产环境配置）
const createAppDatabaseConnection = () => {
  return new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "ba_system",
    synchronize: false, // 生产环境不使用 synchronize
    logging: true,
    entities: [User],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscriber/*.ts"],
  });
};

async function migrateDatabase() {
  const dbName = process.env.DB_DATABASE || "ba_system";
  let connection: DataSource | null = null;

  try {
    console.log("🔄 开始数据库迁移...");
    console.log(`📊 数据库名称: ${dbName}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || "development"}`);

    // 1. 连接到数据库
    console.log("\n1. 连接到数据库...");
    connection = createAppDatabaseConnection();
    await connection.initialize();
    console.log("✅ 成功连接到数据库");

    // 2. 检查迁移状态
    console.log("\n2. 检查迁移状态...");
    const pendingMigrations = await connection.showMigrations();

    if (pendingMigrations) {
      console.log("📋 发现待执行的迁移:");
      const migrations = await connection
        .query(
          `
        SELECT * FROM migrations 
        ORDER BY timestamp DESC 
        LIMIT 10
      `
        )
        .catch(() => []);

      if (migrations.length > 0) {
        migrations.forEach((migration: any) => {
          console.log(
            `  📄 ${migration.name} (${new Date(
              migration.timestamp
            ).toLocaleString()})`
          );
        });
      }
    } else {
      console.log("✅ 所有迁移都是最新的");
    }

    // 3. 执行迁移
    console.log("\n3. 执行数据库迁移...");
    await connection.runMigrations();
    console.log("✅ 数据库迁移完成");

    // 4. 显示当前表结构
    console.log("\n4. 当前数据库表:");
    const tables = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    tables.forEach((table: any) => {
      console.log(`  📋 ${table.table_name}`);
    });

    console.log("\n🎉 数据库迁移完成！");
  } catch (error) {
    console.error("❌ 数据库迁移失败:", error);

    if (error instanceof Error) {
      console.error("错误详情:", error.message);

      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 解决建议:");
        console.log("1. 确保 PostgreSQL 服务正在运行");
        console.log("2. 检查数据库连接配置");
        console.log("3. 确保数据库已存在");
      } else if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        console.log("\n💡 解决建议:");
        console.log("1. 数据库可能不存在，请先运行 'yarn init-db'");
        console.log("2. 或者检查数据库连接配置");
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
  migrateDatabase();
}

export default migrateDatabase;


