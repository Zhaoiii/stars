import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { Student } from "../entities/Student";
import { EvaluationToolNode } from "../entities/EvaluationToolNode";
import { EvaluationScoringOption } from "../entities/EvaluationScoringOption";
import { ShortTermGoal } from "../entities/ShortTermGoal";
import { MultipleChoiceAnswer } from "../entities/MultipleChoiceAnswer";
import { EvaluationRecord } from "../entities/EvaluationRecord";
import { EvaluationRecordItem } from "../entities/EvaluationRecordItem";
import { ReportTemplate } from "../entities/ReportTemplate";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "ba_system",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    Team,
    Student,
    EvaluationToolNode,
    EvaluationScoringOption,
    ShortTermGoal,
    MultipleChoiceAnswer,
    EvaluationRecord,
    EvaluationRecordItem,
    ReportTemplate,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscriber/*.ts"],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();

    console.log(
      `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
      "数据库连接成功"
    );
  } catch (error) {
    console.error("数据库连接失败:", error);
    throw error;
  }
};
