import mongoose, { Schema, Document, Model } from "mongoose";

// 评估得分接口
export interface IEvaluationScore {
  nodeId: string; // 树形节点ID
  nodeName: string; // 节点名称
  isLeaf: boolean; // 是否为叶子节点
  targetCount?: number; // 目标数（仅叶子节点）
  completedCount?: number; // 完成数（仅叶子节点）
}

// 评估记录接口
export interface IEvaluationRecord extends Document {
  _id: string;
  studentId: string; // 学生ID
  toolId: string; // 评估工具ID（树形根节点ID）
  toolName: string; // 评估工具名称
  evaluationScores: IEvaluationScore[]; // 评估得分列表
  status: "in_progress" | "completed" | "archived"; // 评估状态
  evaluatedAt?: Date; // 评估完成时间
  createdAt: Date;
  updatedAt: Date;
}

// 评估记录模型接口
export interface IEvaluationRecordModel extends Model<IEvaluationRecord> {
  createFromTreeStructure(
    studentId: string,
    toolId: string,
    toolName: string,
    treeStructure: any
  ): Promise<IEvaluationRecord>;
  getByStudent(studentId: string): Promise<IEvaluationRecord[]>;
  getByTool(toolId: string): Promise<IEvaluationRecord[]>;
}

// 评估得分子文档模式
const evaluationScoreSchema = new Schema<IEvaluationScore>(
  {
    nodeId: {
      type: String,
      required: true,
    },
    nodeName: {
      type: String,
      required: true,
    },
    isLeaf: {
      type: Boolean,
      required: true,
    },
    targetCount: {
      type: Number,
      min: 0,
    },
    completedCount: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

// 评估记录模式
const evaluationRecordSchema = new Schema<IEvaluationRecord>(
  {
    studentId: {
      type: String,
      required: true,
    },
    toolId: {
      type: String,
      required: true,
    },
    toolName: {
      type: String,
      required: true,
    },
    evaluationScores: [evaluationScoreSchema],
    status: {
      type: String,
      enum: ["in_progress", "completed", "archived"],
      default: "in_progress",
    },
    evaluatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
evaluationRecordSchema.index({ studentId: 1, toolId: 1 });
evaluationRecordSchema.index({ studentId: 1 });
evaluationRecordSchema.index({ toolId: 1 });
evaluationRecordSchema.index({ status: 1 });

// 静态方法：根据树形结构创建评估记录
evaluationRecordSchema.statics.createFromTreeStructure = async function (
  studentId: string,
  toolId: string,
  toolName: string,
  treeStructure: any
) {
  const evaluationScores: IEvaluationScore[] = [];

  // 递归遍历树形结构，生成评估得分
  const buildEvaluationScores = (nodes: any[], parentPath: string = "") => {
    nodes.forEach((node) => {
      const currentPath = parentPath ? `${parentPath}.${node.name}` : node.name;

      const evaluationScore: IEvaluationScore = {
        nodeId: node._id,
        nodeName: node.name,
        isLeaf: node.isLeaf,
        targetCount: node.isLeaf ? node.totalCount : undefined,
        completedCount: node.isLeaf ? 0 : undefined, // 只有叶子节点才记录完成数
      };

      evaluationScore.isLeaf && evaluationScores.push(evaluationScore);

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        buildEvaluationScores(node.children, currentPath);
      }
    });
  };

  buildEvaluationScores([treeStructure]);

  const evaluationRecord = new this({
    studentId,
    toolId,
    toolName,
    evaluationScores,
  });

  return evaluationRecord.save();
};

// 静态方法：根据学生ID获取评估记录
evaluationRecordSchema.statics.getByStudent = function (studentId: string) {
  return this.find({ studentId })
    .populate("studentId", "name")
    .populate("toolId", "name")
    .sort({ createdAt: -1 });
};

// 静态方法：根据工具ID获取评估记录
evaluationRecordSchema.statics.getByTool = function (toolId: string) {
  return this.find({ toolId })
    .populate("studentId", "name")
    .populate("toolId", "name")
    .sort({ createdAt: -1 });
};

export default mongoose.model<IEvaluationRecord, IEvaluationRecordModel>(
  "EvaluationRecord",
  evaluationRecordSchema
);
