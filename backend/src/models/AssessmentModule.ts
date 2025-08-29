import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentModuleDocument extends Document {
  toolId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentModuleSchema = new Schema<IAssessmentModuleDocument>(
  {
    toolId: {
      type: Schema.Types.ObjectId,
      ref: "AssessmentTool",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

assessmentModuleSchema.index({ toolId: 1, name: 1 }, { unique: true });

export const AssessmentModule = mongoose.model<IAssessmentModuleDocument>(
  "AssessmentModule",
  assessmentModuleSchema
);
