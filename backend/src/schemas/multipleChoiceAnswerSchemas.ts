import { z } from "zod";

// 通用：ID 参数
export const IdParamSchema = z.object({ id: z.string().regex(/^\d+$/) });
export type IdParamInput = z.infer<typeof IdParamSchema>;

// 多选答案创建/更新 DTO
export const CreateMultipleChoiceAnswerSchema = z.object({
  label: z.string().min(1).max(255),
  toolId: z.string().regex(/^\d+$/),
  longTermGoalId: z.string().regex(/^\d+$/),
  createdBy: z.string().regex(/^\d+$/).nullable().optional(),
});
export type CreateMultipleChoiceAnswerInput = z.infer<
  typeof CreateMultipleChoiceAnswerSchema
>;

export const UpdateMultipleChoiceAnswerSchema =
  CreateMultipleChoiceAnswerSchema.partial();
export type UpdateMultipleChoiceAnswerInput = z.infer<
  typeof UpdateMultipleChoiceAnswerSchema
>;

// 查询参数
export const QueryMultipleChoiceAnswerSchema = z.object({
  toolId: z.string().regex(/^\d+$/).optional(),
  longTermGoalId: z.string().regex(/^\d+$/).optional(),
  createdBy: z.string().regex(/^\d+$/).optional(),
});
export type QueryMultipleChoiceAnswerInput = z.infer<
  typeof QueryMultipleChoiceAnswerSchema
>;
