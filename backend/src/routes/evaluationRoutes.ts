import { Router } from "express";
import { EvaluationController } from "../controllers/EvaluationController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  validate,
  validateBody,
  validateParams,
} from "../middleware/validation";
import {
  CreateToolSchema,
  CreateNodeWithScoringSchema,
  UpdateNodeWithScoringSchema,
  CreateOptionSchema,
  UpdateOptionSchema,
  IdParamSchema,
  ReorderChildrenSchema,
} from "../schemas/evaluationSchemas";

const router = Router();
const controller = new EvaluationController();

// 所有接口需要管理员权限
router.use(authenticateToken, requireAdmin);

// 工具管理
router.post("/tools", validateBody(CreateToolSchema), controller.createTool);
router.get("/tools", controller.getTools);

// 树形详情
router.get(
  "/tools/:id/tree",
  validateParams(IdParamSchema),
  controller.getToolTree
);

// 节点管理
router.get(
  "/nodes/:id/children",
  validateParams(IdParamSchema),
  controller.getChildren
);
router.post(
  "/nodes",
  validateBody(CreateNodeWithScoringSchema),
  controller.createNode
);
router.put(
  "/nodes/:id",
  validateParams(IdParamSchema),
  validateBody(UpdateNodeWithScoringSchema),
  controller.updateNode
);
router.delete(
  "/nodes/:id",
  validateParams(IdParamSchema),
  controller.deleteNode
);

// 重排同级子节点
router.post(
  "/nodes/:id/reorder",
  validateParams(IdParamSchema),
  validateBody(ReorderChildrenSchema),
  controller.reorderChildren
);

// 选项管理（多选）
router.post(
  "/nodes/:id/options",
  validateParams(IdParamSchema),
  validateBody(CreateOptionSchema),
  controller.addOption
);
router.put(
  "/options/:id",
  validateParams(IdParamSchema),
  validateBody(UpdateOptionSchema),
  controller.updateOption
);
router.delete(
  "/options/:id",
  validateParams(IdParamSchema),
  controller.deleteOption
);

// 只读：获取某个节点的多选项
router.get(
  "/nodes/:id/options",
  validateParams(IdParamSchema),
  controller.listOptions
);

export default router;
