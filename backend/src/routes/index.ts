import { Router } from "express";
import userRoutes from "./userRoutes";
import teamRoutes from "./teamRoutes";
import studentRoutes from "./studentRoutes";

const router = Router();

// API 路由
router.use("/users", userRoutes);
router.use("/teams", teamRoutes);
router.use("/students", studentRoutes);

// 健康检查
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API 服务正常运行",
    timestamp: new Date().toISOString(),
  });
});

export default router;
