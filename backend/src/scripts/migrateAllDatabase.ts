import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { Student } from "../entities/Student";

export const migrateAllDatabase = async () => {
  try {
    console.log("开始完整数据库迁移...");

    // 初始化数据库连接
    await AppDataSource.initialize();
    console.log("数据库连接成功");

    // 1. 创建用户表
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(50),
        "lastName" VARCHAR(50),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager_teacher', 'teacher')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        "teamId" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("用户表创建成功");

    // 2. 创建团队表
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

    // 3. 创建学生表
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        "birthDate" DATE NOT NULL,
        gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
        remarks TEXT,
        "teamId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("学生表创建成功");

    // 4. 创建学生教师关联表
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS student_teachers (
        "studentId" INTEGER NOT NULL,
        "teacherId" INTEGER NOT NULL,
        PRIMARY KEY ("studentId", "teacherId"),
        FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY ("teacherId") REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("学生教师关联表创建成功");

    // 5. 添加外键约束
    await AppDataSource.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS fk_users_team 
      FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE SET NULL;
    `);
    console.log("用户表外键约束添加成功");

    await AppDataSource.query(`
      ALTER TABLE students 
      ADD CONSTRAINT IF NOT EXISTS fk_students_team 
      FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE CASCADE;
    `);
    console.log("学生表外键约束添加成功");

    // 6. 创建索引
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_users_team_id ON users("teamId");
    `);
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_students_team_id ON students("teamId");
    `);
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
    `);
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
    `);
    console.log("索引创建成功");

    // 7. 创建示例数据
    const userRepository = AppDataSource.getRepository(User);
    const teamRepository = AppDataSource.getRepository(Team);
    const studentRepository = AppDataSource.getRepository(Student);

    // 检查是否已有数据
    const existingUsers = await userRepository.count();
    const existingTeams = await teamRepository.count();
    const existingStudents = await studentRepository.count();

    if (existingUsers === 0) {
      // 创建管理员用户
      const adminUser = userRepository.create({
        username: "admin",
        email: "admin@example.com",
        password:
          "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        firstName: "系统",
        lastName: "管理员",
        role: "admin",
        status: "active",
      });
      await userRepository.save(adminUser);
      console.log("创建管理员用户: admin");
    }

    if (existingTeams === 0) {
      // 创建示例团队
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

    if (existingStudents === 0) {
      // 获取第一个团队和教师
      const teams = await teamRepository.find({ take: 1 });
      const teachers = await userRepository.find({
        where: { role: "teacher" },
        take: 2,
      });

      if (teams.length > 0) {
        const sampleStudents = [
          {
            name: "张三",
            birthDate: "2010-05-15",
            gender: "male",
            remarks: "学习认真，表现优秀",
            teamId: teams[0].id,
          },
          {
            name: "李四",
            birthDate: "2011-08-22",
            gender: "female",
            remarks: "活泼开朗，积极参与",
            teamId: teams[0].id,
          },
          {
            name: "王五",
            birthDate: "2009-12-03",
            gender: "male",
            remarks: "需要更多关注",
            teamId: teams[0].id,
          },
        ];

        for (const studentData of sampleStudents) {
          const student = studentRepository.create(studentData);
          const savedStudent = await studentRepository.save(student);

          // 如果有教师，分配给学生
          if (teachers.length > 0) {
            savedStudent.teachers = teachers;
            await studentRepository.save(savedStudent);
          }

          console.log(`创建示例学生: ${savedStudent.name}`);
        }
      }
    }

    console.log("完整数据库迁移完成！");
    console.log("默认管理员账号: admin / password");
  } catch (error) {
    console.error("数据库迁移失败:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  migrateAllDatabase()
    .then(() => {
      console.log("迁移脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("迁移脚本执行失败:", error);
      process.exit(1);
    });
}
