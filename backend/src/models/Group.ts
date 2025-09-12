import mongoose, { Schema, Document, Types } from "mongoose";
import { IGroup } from "../types/group";

export interface IGroupDocument extends Omit<IGroup, "_id">, Document {}

const groupSchema = new Schema<IGroupDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    teachers: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    managers: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student", index: true }],
  },
  { timestamps: true }
);

// 约束：managers 应该是 teachers 的子集（不强制 DB 层，控制器校验）

// 索引
groupSchema.index({ name: 1 }, { unique: true });

export const Group = mongoose.model<IGroupDocument>("Group", groupSchema);
