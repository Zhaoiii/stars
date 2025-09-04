import express from "express";
import {
  createTreeNode,
  getTreeRoots,
  getTreeStructure,
  getTreeNodeById,
  getChildren,
  updateTreeNode,
  deleteTreeNode,
  reorderNodes,
} from "../controllers/treeNodeController";

const router = express.Router();

// 创建树形节点
router.post("/", createTreeNode);

// 获取所有根节点
router.get("/roots", getTreeRoots);

// 获取完整树结构
router.get("/structure", getTreeStructure);

// 获取子节点
router.get("/children/:parentId", getChildren);

// 根据ID获取树形节点
router.get("/:id", getTreeNodeById);

// 更新树形节点
router.put("/:id", updateTreeNode);

// 删除树形节点
router.delete("/:id", deleteTreeNode);

// 重新排序同级节点
router.post("/reorder", reorderNodes);

export default router;
