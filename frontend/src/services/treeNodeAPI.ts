import api from "./api";
import { TreeNode, ApiResponse } from "../types/evaluationRecord";

export const treeNodeAPI = {
  // 获取根节点列表（评估工具）
  getRootNodes: () => {
    return api.get<ApiResponse<TreeNode[]>>("/tree-nodes/roots");
  },

  // 获取单个树节点
  getTreeNode: (id: string) => {
    return api.get<ApiResponse<TreeNode>>(`/tree-nodes/${id}`);
  },
};
