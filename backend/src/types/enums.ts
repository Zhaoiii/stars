export enum UserRole {
  ADMIN = "admin",
  MANAGER_TEACHER = "manager_teacher",
  TEACHER = "teacher",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

// 评估工具：节点类型
export enum EvaluationNodeType {
  ROOT = "root",
  CATEGORY = "category",
  LONG_TERM_GOAL = "long_term_goal",
}

// 评估工具：评分方式
export enum EvaluationScoringType {
  NONE = "none",
  QUANTITY = "quantity",
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
}

// 课程类型
export enum CourseType {
  EVALUATION = "evaluation",
  INDIVIDUAL_TRAINING = "individual_training",
}

// 课程状态
export enum CourseStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// 重复模式
export enum RepeatMode {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}
