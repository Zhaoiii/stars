import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
import routes from "./routes";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(express.json({ limit: "10mb" })); // JSON 解析
app.use(express.urlencoded({ extended: true })); // URL 编码解析

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use("/api", routes);

// 404 处理
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "接口不存在",
  });
});

// 错误处理中间件
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
);

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await initializeDatabase();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📊 环境: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API 地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
};

startServer();


