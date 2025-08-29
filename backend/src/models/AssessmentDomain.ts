import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentDomainDocument extends Document {
  moduleId: string;
  name: string;
  hasStages: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentDomainSchema = new Schema<IAssessmentDomainDocument>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "AssessmentModule",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    hasStages: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assessmentDomainSchema.index({ moduleId: 1, name: 1 }, { unique: true });

export const AssessmentDomain = mongoose.model<IAssessmentDomainDocument>(
  "AssessmentDomain",
  assessmentDomainSchema
);
