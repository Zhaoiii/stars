import mongoose, { Schema, Document } from "mongoose";
import { IStudent, Gender } from "../types/student";

export interface IStudentDocument extends Omit<IStudent, "_id">, Document {}

const studentSchema = new Schema<IStudentDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    assignedTeachers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group", default: [] }],
  },
  {
    timestamps: true,
  }
);

// 添加索引以提高查询性能
studentSchema.index({ name: 1 });
studentSchema.index({ gender: 1 });
studentSchema.index({ birthDate: 1 });
studentSchema.index({ assignedTeachers: 1 });
studentSchema.index({ groups: 1 });

export const Student = mongoose.model<IStudentDocument>(
  "Student",
  studentSchema
);
