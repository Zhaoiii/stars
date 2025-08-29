import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentStageDocument extends Document {
  domainId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentStageSchema = new Schema<IAssessmentStageDocument>(
  {
    domainId: {
      type: String,
      ref: "AssessmentDomain",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

assessmentStageSchema.index({ domainId: 1, name: 1 }, { unique: true });

export const AssessmentStage = mongoose.model<IAssessmentStageDocument>(
  "AssessmentStage",
  assessmentStageSchema
);
