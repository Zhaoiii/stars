import { z } from "zod";
import { EvaluationNodeType, EvaluationScoringType } from "../types/enums";

// 通用：ID 参数
export const IdParamSchema = z.object({ id: z.string().regex(/^\d+$/) });
export type IdParamInput = z.infer<typeof IdParamSchema>;

// 工具（root 节点）创建
export const CreateToolSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10_000).nullable().optional(),
  order: z.number().int().min(0).default(0),
});
export type CreateToolInput = z.infer<typeof CreateToolSchema>;

// 节点创建/更新 DTO
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

export const CreateNodeSchema = z.object({
  parentId: z.string().regex(/^\d+$/).nullable(),
  nodeType: z
    .nativeEnum(EvaluationNodeType)
    .refine((t) => t !== EvaluationNodeType.ROOT, {
      message: "不能创建 root 类型节点",
    }),
  title: z.string().min(1).max(255),
  description: z.string().max(10_000).nullable().optional(),
  targetAge: z.number().int().min(0).max(1440).nullable().optional(),
  order: z.number().int().min(0).default(0),
  scoringType: z.nativeEnum(EvaluationScoringType),
  scoringConfig: z
    .any()
    .nullable()
    .optional()
    .superRefine((val, ctx) => {
      // 具体校验在组合 schema 中用 refine 实现
    }),
});
export type CreateNodeInput = z.infer<typeof CreateNodeSchema>;

export const UpdateNodeSchema = CreateNodeSchema.partial();
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;

// 针对 scoringType 的组合校验
export const CreateNodeWithScoringSchema = CreateNodeSchema.superRefine(
  (data, ctx) => {
    const { nodeType, scoringType, scoringConfig, targetAge } = data as any;

    // 分类节点不允许评分
    if (nodeType === EvaluationNodeType.CATEGORY) {
      if (scoringType !== EvaluationScoringType.NONE || scoringConfig != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "分类节点不支持评分，scoringType 必须为 none 且 scoring_config 为空",
        });
        return;
      }
    }

    // 长期目标必须填写目标月龄
    if (nodeType === EvaluationNodeType.LONG_TERM_GOAL) {
      if (targetAge == null || targetAge <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "长期目标必须填写目标月龄",
        });
      }
    } else {
      // 非长期目标不能填写目标月龄
      if (targetAge != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "只有长期目标才能填写目标月龄",
        });
      }
    }
    if (scoringType === EvaluationScoringType.QUANTITY) {
      const result = scoringConfigSchema.safeParse(scoringConfig);
      console.log(result, scoringConfig);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.quantity === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "数量型 scoring_config 必须为 [{quantity,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.SINGLE_CHOICE) {
      const result = scoringConfigSchema.safeParse(scoringConfig);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.label === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "单选型 scoring_config 必须为 [{label,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
      // 多选型：需要数量-得分规则数组
      const result = z.array(quantityRule).min(0).safeParse(scoringConfig);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.quantity === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "多选型 scoring_config 必须为 [{quantity,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.NONE) {
      if (scoringConfig != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "none 类型 scoring_config 必须为空",
        });
      }
    }
  }
);

export const UpdateNodeWithScoringSchema = UpdateNodeSchema.superRefine(
  (data, ctx) => {
    if (
      !("scoringType" in data) &&
      !("scoringConfig" in data) &&
      !("targetAge" in data)
    )
      return;
    const scoringType = (data as any).scoringType;
    const scoringConfig = (data as any).scoringConfig;
    const nodeType = (data as any).nodeType;
    const targetAge = (data as any).targetAge;

    // 分类节点不允许评分
    if (nodeType === EvaluationNodeType.CATEGORY) {
      if (scoringType && scoringType !== EvaluationScoringType.NONE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "分类节点不支持评分，scoringType 必须为 none",
        });
      }
      if (scoringConfig != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "分类节点 scoring_config 必须为空",
        });
      }
    }

    // 长期目标必须填写目标月龄
    if (nodeType === EvaluationNodeType.LONG_TERM_GOAL) {
      if (targetAge != null && (targetAge <= 0 || targetAge > 1440)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "目标月龄必须在 1-1440 之间",
        });
      }
    } else if (nodeType && nodeType !== EvaluationNodeType.LONG_TERM_GOAL) {
      // 非长期目标不能填写目标月龄
      if (targetAge != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "只有长期目标才能填写目标月龄",
        });
      }
    }
    if (scoringType === EvaluationScoringType.QUANTITY) {
      const result = scoringConfigSchema.safeParse(scoringConfig);
      console.log(result, scoringType);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.quantity === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "数量型 scoring_config 必须为 [{quantity,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.SINGLE_CHOICE) {
      const result = scoringConfigSchema.safeParse(scoringConfig);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.label === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "单选型 scoring_config 必须为 [{label,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
      const result = z.array(quantityRule).min(0).safeParse(scoringConfig);
      if (
        !result.success ||
        !Array.isArray(scoringConfig) ||
        scoringConfig.some((r: any) => r.quantity === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "多选型 scoring_config 必须为 [{quantity,score}] 数组",
        });
      }
    } else if (scoringType === EvaluationScoringType.NONE) {
      if (scoringConfig != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "该类型 scoring_config 必须为空",
        });
      }
    }
  }
);

// 选项 DTO
export const CreateOptionSchema = z.object({
  label: z.string().min(1).max(255),
  score: z.number().int(),
});
export type CreateOptionInput = z.infer<typeof CreateOptionSchema>;

export const UpdateOptionSchema = CreateOptionSchema.partial();
export type UpdateOptionInput = z.infer<typeof UpdateOptionSchema>;

// 重排
export const ReorderChildrenSchema = z.object({
  orderedChildIds: z.array(z.string().regex(/^\d+$/)).min(1),
});
export type ReorderChildrenInput = z.infer<typeof ReorderChildrenSchema>;
