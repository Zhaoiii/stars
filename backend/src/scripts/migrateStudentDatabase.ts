import { AppDataSource } from "../config/database";
import { Student } from "../entities/Student";
import { User } from "../entities/User";
import { Team } from "../entities/Team";

export const migrateStudentDatabase = async () => {
  try {
    console.log("开始学生数据库迁移...");

    // 初始化数据库连接
    await AppDataSource.initialize();
    console.log("数据库连接成功");

    // 创建学生表
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

    // 创建学生教师关联表
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

    // 添加外键约束
    await AppDataSource.query(`
      ALTER TABLE students 
      ADD CONSTRAINT IF NOT EXISTS fk_students_team 
      FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE CASCADE;
    `);
    console.log("学生表外键约束添加成功");

    // 创建索引
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

    // 创建一些示例学生数据
    const studentRepository = AppDataSource.getRepository(Student);
    const userRepository = AppDataSource.getRepository(User);
    const teamRepository = AppDataSource.getRepository(Team);

    // 检查是否已有学生数据
    const existingStudents = await studentRepository.count();
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

    console.log("学生数据库迁移完成！");
  } catch (error) {
    console.error("学生数据库迁移失败:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  migrateStudentDatabase()
    .then(() => {
      console.log("迁移脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("迁移脚本执行失败:", error);
      process.exit(1);
    });
}
