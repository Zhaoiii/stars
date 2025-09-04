export type Score = "已掌握" | "部分掌握" | "未掌握";

export type Milestone = {
  id: string;
  title: string;
  // 当前完成数量
  count?: number;
  // 目标总数（来自叶子节点 totalCount）
  totalCount?: number;
  note?: string;
};

export type TreeNodeItem = {
  _id: string;
  name: string;
  isLeaf: boolean;
  parentId?: string | null;
  totalCount?: number;
  children?: TreeNodeItem[];
};
