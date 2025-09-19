import { z } from "zod";
import { EvaluationScoringType } from "../types/enums";

// 通用：ID 参数
export const IdParamSchema = z.object({ id: z.string().regex(/^\d+$/) });
export type IdParamInput = z.infer<typeof IdParamSchema>;

// 短期目标创建/更新 DTO
const quantityRule = z.object({
  quantity: z.number().int().min(0),
  score: z.number(),
});
const singleChoiceRule = z.object({
  label: z.string().min(1).max(255),
  score: z.number(),
});

const scoringConfigSchema = z.union([
  z.array(quantityRule).min(0),
  z.array(singleChoiceRule).min(0),
]);

export const CreateShortTermGoalSchema = z.object({
  longTermGoalId: z.string().regex(/^\d+$/),
  toolId: z.string().regex(/^\d+$/),
  title: z.string().min(1).max(255),
  description: z.string().max(10_000).nullable().optional(),
  order: z.number().int().min(0).default(0),
});
export type CreateShortTermGoalInput = z.infer<
  typeof CreateShortTermGoalSchema
>;

export const UpdateShortTermGoalSchema = CreateShortTermGoalSchema.partial();
export type UpdateShortTermGoalInput = z.infer<
  typeof UpdateShortTermGoalSchema
>;

// 短期目标不需要评分，直接使用基础 schema
export const CreateShortTermGoalWithScoringSchema = CreateShortTermGoalSchema;
export const UpdateShortTermGoalWithScoringSchema = UpdateShortTermGoalSchema;

// 重排
export const ReorderShortTermGoalsSchema = z.object({
  orderedGoalIds: z.array(z.string().regex(/^\d+$/)).min(1),
});
export type ReorderShortTermGoalsInput = z.infer<
  typeof ReorderShortTermGoalsSchema
>;
