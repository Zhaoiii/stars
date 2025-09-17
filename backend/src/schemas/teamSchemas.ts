import { z } from "zod";

// 创建团队验证模式
export const CreateTeamSchema = z.object({
  name: z
    .string()
    .min(2, "团队名称至少需要2个字符")
    .max(50, "团队名称不能超过50个字符")
    .regex(
      /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
      "团队名称只能包含中文、英文、数字和空格"
    ),

  description: z.string().max(200, "团队描述不能超过200个字符").optional(),
});

// 更新团队验证模式
export const UpdateTeamSchema = z.object({
  name: z
    .string()
    .min(2, "团队名称至少需要2个字符")
    .max(50, "团队名称不能超过50个字符")
    .regex(
      /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
      "团队名称只能包含中文、英文、数字和空格"
    )
    .optional(),

  description: z.string().max(200, "团队描述不能超过200个字符").optional(),
});

// 搜索团队验证模式
export const SearchTeamsSchema = z.object({
  keyword: z.string().max(100, "搜索关键词不能超过100个字符").optional(),

  page: z
    .string()
    .regex(/^\d+$/, "页码必须是数字")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "页码必须大于0")
    .optional()
    .default(() => 1),

  pageSize: z
    .string()
    .regex(/^\d+$/, "每页数量必须是数字")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "每页数量必须在1-100之间")
    .optional()
    .default(() => 20),
});

// 导出类型
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type SearchTeamsInput = z.infer<typeof SearchTeamsSchema>;
