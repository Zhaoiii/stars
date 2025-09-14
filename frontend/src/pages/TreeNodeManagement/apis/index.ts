import api from "../../../services/api";

// 树形节点接口定义
export interface ISegmentScore {
  targetCount: number;
  score: number;
}

export interface IAssistanceType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITreeNode {
  _id: string;
  name: string;
  description?: string;
  isRoot: boolean;
  isLongTermGoal: boolean;
  isShortTermGoal: boolean;
  assistanceTypeId?: string;
  parentId?: string;
  index: number;
  totalCount?: number;
  segmentScores?: ISegmentScore[];
  createdAt: string;
  updatedAt: string;
  children?: ITreeNode[];
}

export interface ITreeNodeInput {
  name: string;
  description?: string;
  isRoot?: boolean;
  isLongTermGoal?: boolean;
  isShortTermGoal?: boolean;
  assistanceTypeId?: string;
  parentId?: string;
  totalCount?: number;
  segmentScores?: ISegmentScore[];
}

export interface IReorderRequest {
  parentId?: string;
  nodeIds: string[];
}

// API 方法
export const getTreeRoots = () => {
  return api.get("/tree-nodes/roots");
};

export const getTreeStructure = () => {
  return api.get("/tree-nodes/structure");
};

export const getTreeNodeById = (id: string) => {
  return api.get(`/tree-nodes/${id}`);
};

export const getChildren = (parentId: string | null) => {
  const url = parentId
    ? `/tree-nodes/children/${parentId}`
    : "/tree-nodes/children/null";
  return api.get(url);
};

export const createTreeNode = (data: ITreeNodeInput) => {
  return api.post("/tree-nodes", data);
};

export const updateTreeNode = (id: string, data: Partial<ITreeNodeInput>) => {
  return api.put(`/tree-nodes/${id}`, data);
};

export const deleteTreeNode = (id: string) => {
  return api.delete(`/tree-nodes/${id}`);
};

export const reorderNodes = (data: IReorderRequest) => {
  return api.post("/tree-nodes/reorder", data);
};

// 辅助类型 API
export const getAssistanceTypes = () => {
  return api.get("/assistance-types");
};
