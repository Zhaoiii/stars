import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validation";
import { z } from "zod";
import { EvaluationRecordController } from "../controllers/EvaluationRecordController";

const router = Router();
const controller = new EvaluationRecordController();

const IdParamSchema = z.object({ id: z.string().regex(/^\d+$/) });
const CreateRecordSchema = z.object({
  studentId: z.string().regex(/^\d+$/),
  toolId: z.string().regex(/^\d+$/),
});
const UpsertItemSchema = z.object({
  longTermGoalId: z.string().regex(/^\d+$/),
  answer: z.any().nullable().optional(),
  score: z.number().nullable().optional(),
});

router.use(authenticateToken);

// 学生的评估记录列表
router.get(
  "/students/:id/records",
  validateParams(IdParamSchema),
  controller.listByStudent
);

// 创建评估记录
router.post("/records", validateBody(CreateRecordSchema), controller.create);

// 开始评估
router.post(
  "/records/:id/start",
  validateParams(IdParamSchema),
  controller.start
);

// 提交评估
router.post(
  "/records/:id/submit",
  validateParams(IdParamSchema),
  controller.submit
);

// 保存/更新某个长期目标条目答案
router.post(
  "/records/:id/items",
  validateParams(IdParamSchema),
  validateBody(UpsertItemSchema),
  controller.upsertItem
);

// 获取评估条目（用于回显）
router.get(
  "/records/:id/items",
  validateParams(IdParamSchema),
  controller.listItems
);

// 评估详情
router.get("/records/:id", validateParams(IdParamSchema), controller.getById);

export default router;
