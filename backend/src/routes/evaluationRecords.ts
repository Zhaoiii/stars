import express from "express";
import {
  createEvaluationRecord,
  getEvaluationRecords,
  getEvaluationRecordById,
  updateEvaluationRecord,
  updateNodeScore,
  deleteEvaluationRecord,
  getEvaluationRecordsByStudent,
  getEvaluationRecordsByTool,
  completeEvaluation,
} from "../controllers/evaluationRecordController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// 所有路由都需要身份验证
router.use(authenticateToken);

// 创建评估记录
router.post("/", createEvaluationRecord);

// 获取所有评估记录（支持分页和筛选）
router.get("/", getEvaluationRecords);

// 根据ID获取评估记录
router.get("/:id", getEvaluationRecordById);

// 更新评估记录
router.put("/:id", updateEvaluationRecord);

// 更新单个节点的得分
router.patch("/:id/nodes/:nodeId", updateNodeScore);

// 完成评估
router.patch("/:id/complete", completeEvaluation);

// 删除评估记录
router.delete("/:id", deleteEvaluationRecord);

// 根据学生ID获取评估记录
router.get("/student/:studentId", getEvaluationRecordsByStudent);

// 根据工具ID获取评估记录
router.get("/tool/:toolId", getEvaluationRecordsByTool);

export default router;
