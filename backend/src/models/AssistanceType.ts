import mongoose, { Schema, Document, Model } from "mongoose";

// 辅助类型接口
export interface IAssistanceType extends Document {
  _id: string;
  name: string;
  code: string; // 英文代码，如 'gesture', 'physical', 'vision', 'verbal'
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 辅助类型模型接口
export interface IAssistanceTypeModel extends Model<IAssistanceType> {
  getActiveTypes(): Promise<IAssistanceType[]>;
}

// 辅助类型模式
const assistanceTypeSchema = new Schema<IAssistanceType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
assistanceTypeSchema.index({ code: 1 });
assistanceTypeSchema.index({ isActive: 1, sortOrder: 1 });

// 静态方法：获取活跃的辅助类型
assistanceTypeSchema.statics.getActiveTypes = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

export default mongoose.model<IAssistanceType, IAssistanceTypeModel>(
  "AssistanceType",
  assistanceTypeSchema
);
