import { AppDataSource } from "../config/database";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

export const migrateTeamDatabase = async () => {
  try {
    console.log("开始团队数据库迁移...");

    // 初始化数据库连接
    await AppDataSource.initialize();
    console.log("数据库连接成功");

    // 创建团队表
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(200),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("团队表创建成功");

    // 为用户表添加团队ID字段
    await AppDataSource.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "teamId" INTEGER;
    `);
    console.log("用户表添加teamId字段成功");

    // 添加外键约束
    await AppDataSource.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS fk_users_team 
      FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE SET NULL;
    `);
    console.log("外键约束添加成功");

    // 创建索引
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_users_team_id ON users("teamId");
    `);
    console.log("索引创建成功");

    // 创建一些示例团队
    const teamRepository = AppDataSource.getRepository(Team);

    // 检查是否已有团队数据
    const existingTeams = await teamRepository.count();
    if (existingTeams === 0) {
      const sampleTeams = [
        {
          name: "教学团队A",
          description: "负责基础课程教学",
        },
        {
          name: "教学团队B",
          description: "负责专业课程教学",
        },
        {
          name: "研究团队",
          description: "负责科研项目和研究工作",
        },
      ];

      for (const teamData of sampleTeams) {
        const team = teamRepository.create(teamData);
        await teamRepository.save(team);
        console.log(`创建示例团队: ${team.name}`);
      }
    }

    console.log("团队数据库迁移完成！");
  } catch (error) {
    console.error("团队数据库迁移失败:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  migrateTeamDatabase()
    .then(() => {
      console.log("迁移脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("迁移脚本执行失败:", error);
      process.exit(1);
    });
}
