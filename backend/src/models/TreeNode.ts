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
      validate: {
        validator: function (this: ITreeNode, value: ISegmentScore[]) {
          // 只有叶子节点才能有分段得分
          if (!this.isLeaf && value && value.length > 0) {
            return false;
          }
          // 验证分段得分的目标数不超过总数
          if (this.isLeaf && this.totalCount && value) {
            return value.every(
              (segment) => segment.targetCount <= this.totalCount!
            );
          }
          return true;
        },
        message: "非叶子节点不能有分段得分，且分段得分的目标数不能超过总数",
      },
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

  next();
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
