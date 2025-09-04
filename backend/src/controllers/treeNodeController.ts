import { Request, Response } from "express";
import TreeNode, { ITreeNode, ISegmentScore } from "../models/TreeNode";
import mongoose from "mongoose";

// 创建树形节点
export const createTreeNode = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      isRoot,
      isLeaf,
      parentId,
      totalCount,
      segmentScores,
    } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({ message: "名称是必填字段" });
    }

    // 如果是叶子节点，验证总数
    if (isLeaf && (totalCount === undefined || totalCount < 0)) {
      return res.status(400).json({ message: "叶子节点必须设置有效的总数" });
    }

    // 验证分段得分
    if (isLeaf && segmentScores) {
      for (const segment of segmentScores) {
        if (segment.targetCount > totalCount) {
          return res.status(400).json({
            message: `分段得分的目标数 ${segment.targetCount} 不能超过总数 ${totalCount}`,
          });
        }
        if (segment.score < 0 || segment.score > 1) {
          return res.status(400).json({
            message: "分段得分的得分值必须在0-1之间",
          });
        }
      }
    }

    // 获取同级节点的最大索引
    const maxIndex = await TreeNode.findOne({ parentId: parentId || null })
      .sort({ index: -1 })
      .select("index");

    const newNode = new TreeNode({
      name,
      description,
      isRoot: isRoot || false,
      isLeaf: isLeaf || false,
      parentId: parentId || null,
      index: (maxIndex?.index || -1) + 1,
      totalCount: isLeaf ? totalCount : undefined,
      segmentScores: isLeaf ? segmentScores || [] : [],
    });

    await newNode.save();

    res.status(201).json({
      success: true,
      data: newNode,
    });
  } catch (error) {
    console.error("创建树形节点失败:", error);
    res.status(500).json({
      success: false,
      message: "创建树形节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 获取所有根节点
export const getTreeRoots = async (req: Request, res: Response) => {
  try {
    const roots = await TreeNode.getRoots();
    res.json({
      success: true,
      data: roots,
    });
  } catch (error) {
    console.error("获取根节点失败:", error);
    res.status(500).json({
      success: false,
      message: "获取根节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 获取完整树结构
export const getTreeStructure = async (req: Request, res: Response) => {
  try {
    const tree = await TreeNode.getTreeStructure();
    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("获取树结构失败:", error);
    res.status(500).json({
      success: false,
      message: "获取树结构失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 根据rootId获取完整子树
export const getSubtreeByRootId = async (req: Request, res: Response) => {
  try {
    const { rootId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(rootId)) {
      return res.status(400).json({ message: "无效的根节点ID" });
    }

    const rootNode = await TreeNode.findById(rootId);
    if (!rootNode) {
      return res.status(404).json({ message: "根节点不存在" });
    }

    const buildTree = async (nodeId: string): Promise<any> => {
      const node = await TreeNode.findById(nodeId);
      if (!node) return null;
      const children = await TreeNode.find({ parentId: node._id }).sort({
        index: 1,
      });
      const childrenWithSubtrees = [] as any[];
      for (const child of children) {
        const subtree = await buildTree(child._id.toString());
        if (subtree) childrenWithSubtrees.push(subtree);
      }
      return {
        ...node.toObject(),
        children: childrenWithSubtrees,
      };
    };

    const subtree = await buildTree(rootId);

    res.json({
      success: true,
      data: subtree,
    });
  } catch (error) {
    console.error("获取子树失败:", error);
    res.status(500).json({
      success: false,
      message: "获取子树失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 根据ID获取树形节点
export const getTreeNodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "无效的节点ID" });
    }

    const node = await TreeNode.findById(id);
    if (!node) {
      return res.status(404).json({ message: "节点不存在" });
    }

    res.json({
      success: true,
      data: node,
    });
  } catch (error) {
    console.error("获取节点失败:", error);
    res.status(500).json({
      success: false,
      message: "获取节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 获取子节点
export const getChildren = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;

    let parentIdValue: string | null = null;
    if (parentId && parentId !== "null" && parentId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "无效的父节点ID" });
      }
      parentIdValue = parentId;
    }

    const children = await TreeNode.getChildren(parentIdValue || null);
    res.json({
      success: true,
      data: children,
    });
  } catch (error) {
    console.error("获取子节点失败:", error);
    res.status(500).json({
      success: false,
      message: "获取子节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 更新树形节点
export const updateTreeNode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isLeaf, totalCount, segmentScores } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "无效的节点ID" });
    }

    const node = await TreeNode.findById(id);
    if (!node) {
      return res.status(404).json({ message: "节点不存在" });
    }

    // 如果是叶子节点，验证总数
    if (isLeaf && (totalCount === undefined || totalCount < 0)) {
      return res.status(400).json({ message: "叶子节点必须设置有效的总数" });
    }

    // 验证分段得分
    if (isLeaf && segmentScores) {
      for (const segment of segmentScores) {
        if (segment.targetCount > totalCount) {
          return res.status(400).json({
            message: `分段得分的目标数 ${segment.targetCount} 不能超过总数 ${totalCount}`,
          });
        }
        if (segment.score < 0 || segment.score > 1) {
          return res.status(400).json({
            message: "分段得分的得分值必须在0-1之间",
          });
        }
      }
    }

    // 如果总数发生变化，清空分段得分
    let finalSegmentScores = segmentScores;
    if (isLeaf && node.totalCount !== totalCount) {
      finalSegmentScores = [];
    }

    const updatedNode = await TreeNode.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isLeaf,
        totalCount: isLeaf ? totalCount : undefined,
        segmentScores: isLeaf ? finalSegmentScores : [],
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedNode,
    });
  } catch (error) {
    console.error("更新节点失败:", error);
    res.status(500).json({
      success: false,
      message: "更新节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 删除树形节点
export const deleteTreeNode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "无效的节点ID" });
    }

    const node = await TreeNode.findById(id);
    if (!node) {
      return res.status(404).json({ message: "节点不存在" });
    }

    // 检查是否有子节点
    const children = await TreeNode.getChildren(id);
    if (children.length > 0) {
      return res.status(400).json({ message: "不能删除有子节点的节点" });
    }

    await TreeNode.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "节点删除成功",
    });
  } catch (error) {
    console.error("删除节点失败:", error);
    res.status(500).json({
      success: false,
      message: "删除节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 重新排序同级节点
export const reorderNodes = async (req: Request, res: Response) => {
  try {
    const { parentId, nodeIds } = req.body;

    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      return res.status(400).json({ message: "节点ID列表不能为空" });
    }

    // 验证所有节点ID
    for (const nodeId of nodeIds) {
      if (!mongoose.Types.ObjectId.isValid(nodeId)) {
        return res.status(400).json({ message: `无效的节点ID: ${nodeId}` });
      }
    }

    // 验证父节点ID（如果提供）
    if (parentId && parentId !== "null" && parentId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "无效的父节点ID" });
      }
    }

    const updatedNodes = await TreeNode.reorderSiblings(
      parentId === "null" || parentId === "undefined" ? undefined : parentId,
      nodeIds
    );

    res.json({
      success: true,
      data: updatedNodes,
      message: "节点排序更新成功",
    });
  } catch (error) {
    console.error("重新排序节点失败:", error);
    res.status(500).json({
      success: false,
      message: "重新排序节点失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};
