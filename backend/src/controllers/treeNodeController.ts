import { Request, Response } from "express";
import { TreeNode } from "../models/TreeNode";
import {
  ITreeNodeInput,
  ITreeNodeUpdate,
  ITreeNodeResponse,
  ITreeStructureResponse,
  IReorderRequest,
} from "../types/treeNode";
import mongoose from "mongoose";

export class TreeNodeController {
  // 获取所有根节点
  static async getRootNodes(req: Request, res: Response): Promise<void> {
    try {
      const roots = await TreeNode.find({ isRoot: true })
        .sort({ index: 1 })
        .lean()
        .exec();

      res.json({
        success: true,
        data: roots,
        count: roots.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "获取根节点失败",
        error: error.message,
      });
    }
  }

  // 获取完整的树形结构
  static async getTreeStructure(req: Request, res: Response): Promise<void> {
    try {
      const buildTree = async (
        parentId: string | null = null
      ): Promise<ITreeNodeResponse[]> => {
        const nodes = await TreeNode.find({ parentId })
          .sort({ index: 1 })
          .lean()
          .exec();

        const result: ITreeNodeResponse[] = [];
        for (const node of nodes) {
          const children = await buildTree(node._id.toString());
          result.push({
            ...node,
            _id: node._id.toString(),
            parentId: node.parentId?.toString(),
            preLevelNode: node.preLevelNode?.toString(),
            nextLevelNode: node.nextLevelNode?.toString(),
            children,
          });
        }
        return result;
      };

      const roots = await buildTree();
      const totalCount = await TreeNode.countDocuments();

      const response: ITreeStructureResponse = {
        roots,
        totalCount,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "获取树形结构失败",
        error: error.message,
      });
    }
  }

  // 根据ID获取节点及其子树
  static async getNodeWithChildren(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "无效的节点ID",
        });
        return;
      }

      const buildSubtree = async (
        nodeId: string
      ): Promise<ITreeNodeResponse | null> => {
        const node = await TreeNode.findById(nodeId).lean().exec();
        if (!node) return null;

        const children = await TreeNode.find({ parentId: nodeId })
          .sort({ index: 1 })
          .lean()
          .exec();

        const childrenWithSubtrees: ITreeNodeResponse[] = [];
        for (const child of children) {
          const subtree = await buildSubtree(child._id.toString());
          if (subtree) {
            childrenWithSubtrees.push(subtree);
          }
        }

        return {
          ...node,
          _id: node._id.toString(),
          parentId: node.parentId?.toString(),
          preLevelNode: node.preLevelNode?.toString(),
          nextLevelNode: node.nextLevelNode?.toString(),
          children: childrenWithSubtrees,
        };
      };

      const result = await buildSubtree(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "节点不存在",
        });
        return;
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "获取节点失败",
        error: error.message,
      });
    }
  }

  // 创建节点
  static async createNode(req: Request, res: Response): Promise<void> {
    try {
      const input: ITreeNodeInput = req.body;

      // 验证父节点是否存在（如果指定了parentId）
      if (input.parentId && !mongoose.Types.ObjectId.isValid(input.parentId)) {
        res.status(400).json({
          success: false,
          message: "无效的父节点ID",
        });
        return;
      }

      if (input.parentId) {
        const parentNode = await TreeNode.findById(input.parentId);
        if (!parentNode) {
          res.status(400).json({
            success: false,
            message: "父节点不存在",
          });
          return;
        }
      }

      // 确定是否为根节点
      const isRoot = !input.parentId || input.isRoot === true;

      // 获取下一个index值
      const nextIndex =
        input.index !== undefined
          ? input.index
          : await (TreeNode as any).getNextIndex(input.parentId || null);

      // 如果指定了index，需要调整其他节点的index
      if (input.index !== undefined) {
        await TreeNode.updateMany(
          {
            parentId: input.parentId || null,
            index: { $gte: input.index },
          },
          { $inc: { index: 1 } }
        );
      }

      const nodeData = {
        name: input.name,
        description: input.description,
        isRoot,
        isLeaf: input.isLeaf || false,
        preLevelNode: input.preLevelNode || null,
        parentId: input.parentId || null,
        index: nextIndex,
      };

      const newNode = new TreeNode(nodeData);
      await newNode.save();

      // 更新前级节点的nextLevelNode
      if (input.preLevelNode) {
        await TreeNode.findByIdAndUpdate(input.preLevelNode, {
          nextLevelNode: newNode._id,
        });
      }

      res.status(201).json({
        success: true,
        data: newNode,
        message: "节点创建成功",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "创建节点失败",
        error: error.message,
      });
    }
  }

  // 更新节点
  static async updateNode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const update: ITreeNodeUpdate = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "无效的节点ID",
        });
        return;
      }

      const existingNode = await TreeNode.findById(id);
      if (!existingNode) {
        res.status(404).json({
          success: false,
          message: "节点不存在",
        });
        return;
      }

      // 清除旧的前级节点关联
      if (
        existingNode.preLevelNode &&
        update.preLevelNode !== existingNode.preLevelNode.toString()
      ) {
        await TreeNode.findByIdAndUpdate(existingNode.preLevelNode, {
          $unset: { nextLevelNode: 1 },
        });
      }

      // 更新节点
      const updatedNode = await TreeNode.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true }
      );

      // 设置新的前级节点关联
      if (update.preLevelNode) {
        await TreeNode.findByIdAndUpdate(update.preLevelNode, {
          nextLevelNode: id,
        });
      }

      res.json({
        success: true,
        data: updatedNode,
        message: "节点更新成功",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "更新节点失败",
        error: error.message,
      });
    }
  }

  // 删除节点及其所有子节点
  static async deleteNode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "无效的节点ID",
        });
        return;
      }

      const node = await TreeNode.findById(id);
      if (!node) {
        res.status(404).json({
          success: false,
          message: "节点不存在",
        });
        return;
      }

      // 递归删除所有子节点
      const deleteRecursive = async (nodeId: string) => {
        const children = await TreeNode.find({ parentId: nodeId });
        for (const child of children) {
          await deleteRecursive((child._id as any).toString());
        }
        await TreeNode.findByIdAndDelete(nodeId);
      };

      // 清除关联关系
      if (node.preLevelNode) {
        await TreeNode.findByIdAndUpdate(node.preLevelNode, {
          $unset: { nextLevelNode: 1 },
        });
      }
      if (node.nextLevelNode) {
        await TreeNode.findByIdAndUpdate(node.nextLevelNode, {
          $unset: { preLevelNode: 1 },
        });
      }

      await deleteRecursive(id);

      res.json({
        success: true,
        message: "节点删除成功",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "删除节点失败",
        error: error.message,
      });
    }
  }

  // 同级节点重新排序
  static async reorderSiblings(req: Request, res: Response): Promise<void> {
    try {
      const { parentId, nodeIds }: IReorderRequest = req.body;

      // 验证所有节点ID的有效性
      for (const nodeId of nodeIds) {
        if (!mongoose.Types.ObjectId.isValid(nodeId)) {
          res.status(400).json({
            success: false,
            message: `无效的节点ID: ${nodeId}`,
          });
          return;
        }
      }

      // 验证所有节点都属于同一父节点
      const nodes = await TreeNode.find({
        _id: { $in: nodeIds },
        parentId: parentId || null,
      });

      if (nodes.length !== nodeIds.length) {
        res.status(400).json({
          success: false,
          message: "部分节点不存在或不属于指定的父节点",
        });
        return;
      }

      // 批量更新索引
      const updatePromises = nodeIds.map((nodeId, index) =>
        TreeNode.findByIdAndUpdate(nodeId, { index })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "节点排序更新成功",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "重新排序失败",
        error: error.message,
      });
    }
  }

  // 获取可选择的前级节点（兄弟节点）
  static async getAvailablePreLevelNodes(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "无效的节点ID",
        });
        return;
      }

      const currentNode = await TreeNode.findById(id);
      if (!currentNode) {
        res.status(404).json({
          success: false,
          message: "节点不存在",
        });
        return;
      }

      // 获取兄弟节点作为可选择的前级节点
      const siblings = await TreeNode.find({
        parentId: currentNode.parentId,
        _id: { $ne: id },
      })
        .sort({ index: 1 })
        .lean()
        .exec();

      res.json({
        success: true,
        data: siblings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "获取可选择的前级节点失败",
        error: error.message,
      });
    }
  }
}
