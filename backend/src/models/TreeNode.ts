import mongoose, { Schema, Document, Model } from "mongoose";

// 分段得分接口
export interface ISegmentScore {
  targetCount: number; // 目标数
  score: number; // 得分 (0-1)
}

// 树形节点接口
export interface ITreeNode extends Document {
  _id: string;
  name: string;
  description?: string;
  isRoot: boolean;
  isLeaf: boolean;
  parentId?: string;
  index: number; // 同级排序索引
  totalCount?: number; // 总数（仅叶子节点）
  segmentScores?: ISegmentScore[]; // 分段得分（仅叶子节点）
  createdAt: Date;
  updatedAt: Date;
}

// 树形节点模型接口
export interface ITreeNodeModel extends Model<ITreeNode> {
  getRoots(): Promise<ITreeNode[]>;
  getChildren(parentId: string | null): Promise<ITreeNode[]>;
  getTreeStructure(): Promise<ITreeNode[]>;
  reorderSiblings(
    parentId: string | undefined,
    nodeIds: string[]
  ): Promise<ITreeNode[]>;
}

// 分段得分子文档模式
const segmentScoreSchema = new Schema<ISegmentScore>(
  {
    targetCount: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

// 树形节点模式
const treeNodeSchema = new Schema<ITreeNode>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
    isLeaf: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "TreeNode",
      default: null,
    },
    index: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: ITreeNode, value: number) {
          // 只有叶子节点才需要总数
          return !this.isLeaf || value !== undefined;
        },
        message: "叶子节点必须设置总数",
      },
    },
    segmentScores: {
      type: [segmentScoreSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 索引
treeNodeSchema.index({ parentId: 1, index: 1 });
treeNodeSchema.index({ isRoot: 1 });

// 中间件：保存前验证
treeNodeSchema.pre("save", function (next) {
  // 如果是叶子节点，必须有总数
  if (this.isLeaf && this.totalCount === undefined) {
    return next(new Error("叶子节点必须设置总数"));
  }

  // 如果不是叶子节点，清空总数和分段得分
  if (!this.isLeaf) {
    this.totalCount = undefined;
    this.segmentScores = [];
  }

  // 验证分段得分
  if (this.isLeaf && this.segmentScores && this.segmentScores.length > 0) {
    // 检查是否有总数
    if (this.totalCount === undefined) {
      return next(new Error("叶子节点必须设置总数才能配置分段得分"));
    }

    // 验证分段得分的目标数不超过总数
    const invalidSegments = this.segmentScores.filter(
      (segment) => segment.targetCount > this.totalCount!
    );

    if (invalidSegments.length > 0) {
      return next(new Error(`分段得分的目标数不能超过总数 ${this.totalCount}`));
    }

    // 验证分段得分的分数范围
    const invalidScores = this.segmentScores.filter(
      (segment) => segment.score < 0 || segment.score > 1
    );

    if (invalidScores.length > 0) {
      return next(new Error("分段得分的分数必须在 0-1 之间"));
    }
  }

  next();
});

// 中间件：更新前验证
treeNodeSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  // 如果更新中包含 isLeaf 字段
  if (update && typeof update.isLeaf === "boolean") {
    // 如果设置为非叶子节点，清空总数和分段得分
    if (!update.isLeaf) {
      update.totalCount = undefined;
      update.segmentScores = [];
    }
  }

  // 如果更新中包含 segmentScores 字段
  if (update && update.segmentScores) {
    try {
      // 使用 findById 而不是 findOne 来避免查询冲突
      const doc = await this.model.findById(this.getQuery()._id);

      if (
        doc &&
        doc.isLeaf &&
        update.segmentScores &&
        update.segmentScores.length > 0
      ) {
        // 检查是否有总数
        const totalCount =
          update.totalCount !== undefined ? update.totalCount : doc.totalCount;
        if (totalCount === undefined) {
          return next(new Error("叶子节点必须设置总数才能配置分段得分"));
        }

        // 验证分段得分的目标数不超过总数
        const invalidSegments = update.segmentScores.filter(
          (segment: ISegmentScore) => segment.targetCount > totalCount
        );

        if (invalidSegments.length > 0) {
          return next(new Error(`分段得分的目标数不能超过总数 ${totalCount}`));
        }

        // 验证分段得分的分数范围
        const invalidScores = update.segmentScores.filter(
          (segment: ISegmentScore) => segment.score < 0 || segment.score > 1
        );

        if (invalidScores.length > 0) {
          return next(new Error("分段得分的分数必须在 0-1 之间"));
        }
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// 静态方法：获取根节点
treeNodeSchema.statics.getRoots = function () {
  return this.find({ isRoot: true }).sort({ index: 1 });
};

// 静态方法：获取子节点
treeNodeSchema.statics.getChildren = function (parentId: string | null) {
  return this.find({ parentId }).sort({ index: 1 });
};

// 静态方法：获取完整树结构
treeNodeSchema.statics.getTreeStructure = async function () {
  const roots = await this.find({ isRoot: true }).sort({ index: 1 });

  const buildTree = async (nodes: ITreeNode[]): Promise<ITreeNode[]> => {
    const result: ITreeNode[] = [];

    for (const node of nodes) {
      const children = await this.find({ parentId: node._id }).sort({
        index: 1,
      });
      const nodeWithChildren = {
        ...node.toObject(),
        children: children.length > 0 ? await buildTree(children) : [],
      };
      result.push(nodeWithChildren);
    }

    return result;
  };

  return await buildTree(roots);
};

// 静态方法：重新排序同级节点
treeNodeSchema.statics.reorderSiblings = async function (
  parentId: string | undefined,
  nodeIds: string[]
) {
  const updatePromises = nodeIds.map((nodeId, index) =>
    this.findByIdAndUpdate(nodeId, { index, parentId }, { new: true })
  );

  return Promise.all(updatePromises);
};

export default mongoose.model<ITreeNode, ITreeNodeModel>(
  "TreeNode",
  treeNodeSchema
);
