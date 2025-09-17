import { z } from "zod";
import { Gender } from "../types/enums";

// 性别枚举
export const GenderSchema = z.enum(Gender);

// 创建学生验证模式
export const CreateStudentSchema = z.object({
  name: z
    .string()
    .min(1, "学生姓名不能为空")
    .max(50, "学生姓名不能超过50个字符"),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "出生日期格式必须为YYYY-MM-DD")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, "出生日期不能晚于今天"),

  gender: GenderSchema,

  remarks: z
    .string()
    .max(500, "备注不能超过500个字符")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => (val === "" || val === null ? undefined : val)),

  teamId: z.number().int("团队ID必须是整数").positive("团队ID必须是正数"),

  teacherIds: z.array(z.number().int().positive()).optional().default([]),
});

// 更新学生验证模式
export const UpdateStudentSchema = z.object({
  name: z
    .string()
    .min(1, "学生姓名不能为空")
    .max(50, "学生姓名不能超过50个字符")
    .optional(),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "出生日期格式必须为YYYY-MM-DD")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, "出生日期不能晚于今天")
    .optional(),

  gender: GenderSchema.optional(),

  remarks: z
    .string()
    .max(500, "备注不能超过500个字符")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => (val === "" || val === null ? undefined : val)),

  teamId: z
    .number()
    .int("团队ID必须是整数")
    .positive("团队ID必须是正数")
    .optional(),

  teacherIds: z.array(z.number().int().positive()).optional(),
});

// 搜索学生验证模式
export const SearchStudentsSchema = z.object({
  keyword: z.string().max(100, "搜索关键词不能超过100个字符").optional(),

  teamId: z
    .string()
    .regex(/^\d+$/, "团队ID必须是数字")
    .transform((val) => parseInt(val, 10))
    .optional(),

  gender: GenderSchema.optional(),

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

// 分配教师验证模式
export const AssignTeachersSchema = z.object({
  teacherIds: z
    .array(z.number().int().positive())
    .min(1, "至少需要选择一个教师"),
});

// 导出类型
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type SearchStudentsInput = z.infer<typeof SearchStudentsSchema>;
export type AssignTeachersInput = z.infer<typeof AssignTeachersSchema>;
