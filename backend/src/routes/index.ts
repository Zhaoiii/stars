import { Router } from "express";
import userRoutes from "./userRoutes";
import teamRoutes from "./teamRoutes";
import studentRoutes from "./studentRoutes";
import evaluationRoutes from "./evaluationRoutes";
import shortTermGoalRoutes from "./shortTermGoalRoutes";
import multipleChoiceAnswerRoutes from "./multipleChoiceAnswerRoutes";

const router = Router();

// API 路由
router.use("/users", userRoutes);
router.use("/teams", teamRoutes);
router.use("/students", studentRoutes);
router.use("/evaluation", evaluationRoutes);
router.use("/short-term-goals", shortTermGoalRoutes);
router.use("/multiple-choice-answers", multipleChoiceAnswerRoutes);

// 健康检查
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API 服务正常运行",
    timestamp: new Date().toISOString(),
  });
});

export default router;
