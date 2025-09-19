import { Router } from "express";
import { ShortTermGoalController } from "../controllers/ShortTermGoalController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  validate,
  validateBody,
  validateParams,
} from "../middleware/validation";
import {
  CreateShortTermGoalWithScoringSchema,
  UpdateShortTermGoalWithScoringSchema,
  ReorderShortTermGoalsSchema,
  IdParamSchema,
} from "../schemas/shortTermGoalSchemas";

const router = Router();
const controller = new ShortTermGoalController();

// 所有接口需要管理员权限
router.use(authenticateToken, requireAdmin);

// 短期目标管理
router.post(
  "/",
  validateBody(CreateShortTermGoalWithScoringSchema),
  controller.createGoal
);
router.get("/", controller.getAllGoals);
router.get(
  "/tool/:id",
  validateParams(IdParamSchema),
  controller.getGoalsByToolId
);
router.get(
  "/long-term-goal/:id",
  validateParams(IdParamSchema),
  controller.getGoalsByLongTermGoalId
);
router.get("/:id", validateParams(IdParamSchema), controller.getGoalById);
router.put(
  "/:id",
  validateParams(IdParamSchema),
  validateBody(UpdateShortTermGoalWithScoringSchema),
  controller.updateGoal
);
router.delete("/:id", validateParams(IdParamSchema), controller.deleteGoal);

// 重排短期目标
router.post(
  "/long-term-goal/:id/reorder",
  validateParams(IdParamSchema),
  validateBody(ReorderShortTermGoalsSchema),
  controller.reorderGoals
);

export default router;
