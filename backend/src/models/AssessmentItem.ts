import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentItemDocument extends Document {
  stageId?: string; // 如果领域有阶段，挂靠到阶段
  domainId?: string; // 如果领域没有阶段，直接挂靠到领域
  name: string;
  description?: string;
  scoreType: "pass_fail" | "scale" | "custom"; // 对错、好中差、自定义记分
  scoreConfig?: {
    maxScore?: number; // 最大分数
    passScore?: number; // 及格分数
    scaleLevels?: string[]; // 好中差等级
    customScoring?: boolean; // 是否自定义记分
  };
  isRequired: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentItemSchema = new Schema<IAssessmentItemDocument>(
  {
    stageId: { type: String, ref: "AssessmentStage", index: true },
    domainId: { type: String, ref: "AssessmentDomain", index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    scoreType: { 
      type: String, 
      required: true, 
      enum: ["pass_fail", "scale", "custom"],
      default: "pass_fail"
    },
    scoreConfig: {
      maxScore: { type: Number, min: 1 },
      passScore: { type: Number, min: 0 },
      scaleLevels: [{ type: String, trim: true }],
      customScoring: { type: Boolean, default: false }
    },
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 确保要么挂靠到阶段，要么挂靠到领域，但不能同时挂靠
assessmentItemSchema.index({ stageId: 1, name: 1 }, { unique: true, sparse: true });
assessmentItemSchema.index({ domainId: 1, name: 1 }, { unique: true, sparse: true });

export const AssessmentItem = mongoose.model<IAssessmentItemDocument>(
  "AssessmentItem",
  assessmentItemSchema
);
