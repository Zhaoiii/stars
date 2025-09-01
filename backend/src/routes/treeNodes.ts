import express from "express";
import { TreeNodeController } from "../controllers/treeNodeController";
import { auth } from "../middleware/auth";

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取所有根节点
router.get("/roots", TreeNodeController.getRootNodes);

// 获取完整的树形结构
router.get("/tree", TreeNodeController.getTreeStructure);

// 根据ID获取节点及其子树
router.get("/:id", TreeNodeController.getNodeWithChildren);

// 获取可选择的前级节点
router.get(
  "/:id/available-pre-level",
  TreeNodeController.getAvailablePreLevelNodes
);

// 创建节点
router.post("/", TreeNodeController.createNode);

// 更新节点
router.put("/:id", TreeNodeController.updateNode);

// 删除节点
router.delete("/:id", TreeNodeController.deleteNode);

// 同级节点重新排序
router.post("/reorder", TreeNodeController.reorderSiblings);

export default router;
