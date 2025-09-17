import { z } from "zod";

// 用户角色枚举
export const UserRoleSchema = z.enum(["admin", "manager_teacher", "teacher"]);

// 用户状态枚举
export const UserStatusSchema = z.enum(["active", "inactive", "suspended"]);

// 创建用户验证模式
export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(30, "用户名不能超过30个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),

  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .max(100, "邮箱地址不能超过100个字符"),

  password: z
    .string()
    .min(6, "密码至少需要6个字符")
    .max(50, "密码不能超过50个字符"),

  name: z
    .string()
    .min(1, "姓名不能为空")
    .max(50, "姓名不能超过50个字符")
    .optional(),

  role: UserRoleSchema.default("teacher"),

  status: UserStatusSchema.default("active"),

  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码")
    .optional()
    .or(z.literal("")),

  avatar: z.string().url("头像必须是有效的URL").optional().or(z.literal("")),

  teamId: z
    .number()
    .int("团队ID必须是整数")
    .positive("团队ID必须是正数")
    .optional(),
});

// 更新用户验证模式
export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(30, "用户名不能超过30个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线")
    .optional(),

  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .max(100, "邮箱地址不能超过100个字符")
    .optional(),

  name: z
    .string()
    .min(1, "姓名不能为空")
    .max(50, "姓名不能超过50个字符")
    .optional(),

  role: UserRoleSchema.optional(),

  status: UserStatusSchema.optional(),

  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码")
    .optional()
    .or(z.literal("")),

  avatar: z.string().url("头像必须是有效的URL").optional().or(z.literal("")),

  teamId: z
    .number()
    .int("团队ID必须是整数")
    .positive("团队ID必须是正数")
    .optional(),
});

// 登录验证模式
export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, "用户名不能为空")
    .max(30, "用户名不能超过30个字符"),

  password: z.string().min(1, "密码不能为空").max(50, "密码不能超过50个字符"),
});

// 搜索用户验证模式
export const SearchUsersSchema = z.object({
  keyword: z.string().max(100, "搜索关键词不能超过100个字符").optional(),

  role: UserRoleSchema.optional(),

  status: UserStatusSchema.optional(),

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
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
