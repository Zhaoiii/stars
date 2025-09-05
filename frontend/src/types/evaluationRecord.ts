// 评估得分接口
export interface EvaluationScore {
  nodeId: string;
  nodeName: string;
  isLeaf: boolean;
  targetCount?: number;
  completedCount?: number;
}

// 学生接口
export interface Student {
  _id: string;
  name: string;
  gender: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

// 树节点接口
export interface TreeNode {
  _id: string;
  name: string;
  description?: string;
  isLeaf: boolean;
  children?: TreeNode[];
}

// 评估记录接口
export interface EvaluationRecord {
  _id: string;
  studentId: string | Student;
  toolId: string | TreeNode;
  toolName: string;
  evaluationScores: EvaluationScore[];
  status: "in_progress" | "completed" | "archived";
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 筛选条件接口
export interface EvaluationRecordFilter {
  studentId?: string;
  toolId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// 分页信息接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}
