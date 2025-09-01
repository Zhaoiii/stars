export interface ITreeNode {
  _id: string;
  name: string;
  description?: string;
  isRoot: boolean;
  isLeaf: boolean;
  preLevelNode?: string; // 前一个等级节点的ID
  nextLevelNode?: string; // 下一个等级节点的ID
  index: number; // 同级排序索引
  parentId?: string; // 父节点ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ITreeNodeInput {
  name: string;
  description?: string;
  isRoot?: boolean;
  isLeaf?: boolean;
  preLevelNode?: string;
  parentId?: string;
  index?: number;
}

export interface ITreeNodeUpdate {
  name?: string;
  description?: string;
  isLeaf?: boolean;
  preLevelNode?: string;
  index?: number;
}

export interface ITreeNodeResponse {
  _id: string;
  name: string;
  description?: string;
  isRoot: boolean;
  isLeaf: boolean;
  preLevelNode?: string;
  nextLevelNode?: string;
  index: number;
  parentId?: string;
  children?: ITreeNodeResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITreeStructureResponse {
  roots: ITreeNodeResponse[];
  totalCount: number;
}

export interface IReorderRequest {
  parentId?: string;
  nodeIds: string[];
}
