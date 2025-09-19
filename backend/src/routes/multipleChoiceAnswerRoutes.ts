import { Router } from "express";
import { MultipleChoiceAnswerController } from "../controllers/MultipleChoiceAnswerController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  CreateMultipleChoiceAnswerSchema,
  UpdateMultipleChoiceAnswerSchema,
  QueryMultipleChoiceAnswerSchema,
  IdParamSchema,
} from "../schemas/multipleChoiceAnswerSchemas";
import { z } from "zod";

const router = Router();
const controller = new MultipleChoiceAnswerController();

// 所有接口需要管理员权限
router.use(authenticateToken, requireAdmin);

// 多选答案管理
router.post(
  "/",
  validateBody(CreateMultipleChoiceAnswerSchema),
  controller.createAnswer
);
router.get("/", controller.getAllAnswers);
router.get(
  "/query",
  validateQuery(QueryMultipleChoiceAnswerSchema),
  controller.getAnswersByQuery
);
router.get(
  "/tool/:id",
  validateParams(IdParamSchema),
  controller.getAnswersByToolId
);
router.get(
  "/long-term-goal/:id",
  validateParams(IdParamSchema),
  controller.getAnswersByLongTermGoalId
);
router.get("/:id", validateParams(IdParamSchema), controller.getAnswerById);
router.put(
  "/:id",
  validateParams(IdParamSchema),
  validateBody(UpdateMultipleChoiceAnswerSchema),
  controller.updateAnswer
);
router.delete("/:id", validateParams(IdParamSchema), controller.deleteAnswer);

// 批量操作
router.post(
  "/batch",
  validateBody(
    z.object({
      answers: z.array(CreateMultipleChoiceAnswerSchema).min(1),
    })
  ),
  controller.createAnswers
);
router.delete(
  "/tool/:toolId/long-term-goal/:longTermGoalId",
  validateParams(
    z.object({
      toolId: IdParamSchema.shape.id,
      longTermGoalId: IdParamSchema.shape.id,
    })
  ),
  controller.deleteAnswersByToolAndGoal
);

export default router;
