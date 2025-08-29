import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentToolDocument extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentToolSchema = new Schema<IAssessmentToolDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

assessmentToolSchema.index({ name: 1 }, { unique: true });

export const AssessmentTool = mongoose.model<IAssessmentToolDocument>(
  "AssessmentTool",
  assessmentToolSchema
);
