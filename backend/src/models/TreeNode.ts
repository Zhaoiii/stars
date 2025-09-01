import mongoose, { Schema, Document } from "mongoose";
import { ITreeNode } from "../types/treeNode";

export interface ITreeNodeDocument extends Omit<ITreeNode, "_id">, Document {}

const treeNodeSchema = new Schema<ITreeNodeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isRoot: {
      type: Boolean,
      required: true,
      default: false,
    },
    isLeaf: {
      type: Boolean,
      required: true,
      default: false,
    },
    preLevelNode: {
      type: Schema.Types.ObjectId,
      ref: "TreeNode",
      default: null,
    },
    nextLevelNode: {
      type: Schema.Types.ObjectId,
      ref: "TreeNode",
      default: null,
    },
    index: {
      type: Number,
      required: true,
      default: 0,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "TreeNode",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引以提高查询性能
treeNodeSchema.index({ parentId: 1, index: 1 }); // 复合索引用于排序查询
treeNodeSchema.index({ isRoot: 1 });
treeNodeSchema.index({ isLeaf: 1 });
treeNodeSchema.index({ preLevelNode: 1 });
treeNodeSchema.index({ nextLevelNode: 1 });

// 中间件：确保根节点的parentId为null
treeNodeSchema.pre("save", function (next) {
  if (this.isRoot) {
    this.parentId = undefined;
  }
  next();
});

// 中间件：叶子节点必须有description
treeNodeSchema.pre("save", function (next) {
  if (this.isLeaf && !this.description) {
    return next(new Error("叶子节点必须有描述信息"));
  }
  next();
});

// 静态方法：获取下一个index值
treeNodeSchema.statics.getNextIndex = async function (parentId: string | null) {
  const lastNode = await this.findOne({ parentId }).sort({ index: -1 }).exec();
  return lastNode ? lastNode.index + 1 : 0;
};

export const TreeNode = mongoose.model<ITreeNodeDocument>(
  "TreeNode",
  treeNodeSchema
);
