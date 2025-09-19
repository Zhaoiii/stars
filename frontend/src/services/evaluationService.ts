import api, { ApiResponse } from "./api";
import {
  CreateNodePayload,
  CreateOptionPayload,
  CreateToolPayload,
  EvaluationToolNodeDTO,
  UpdateNodePayload,
  UpdateOptionPayload,
} from "@/types/evaluation";

export const EvaluationAPI = {
  // 工具
  createTool(payload: CreateToolPayload) {
    return api.post<ApiResponse<EvaluationToolNodeDTO>>(
      "/evaluation/tools",
      payload
    );
  },
  getTools() {
    return api.get<ApiResponse<EvaluationToolNodeDTO[]>>("/evaluation/tools");
  },
  getToolTree(id: string) {
    return api.get<ApiResponse<EvaluationToolNodeDTO>>(
      `/evaluation/tools/${id}/tree`
    );
  },

  // 节点
  getChildren(id: string) {
    return api.get<ApiResponse<EvaluationToolNodeDTO[]>>(
      `/evaluation/nodes/${id}/children`
    );
  },
  createNode(payload: CreateNodePayload) {
    return api.post<ApiResponse<EvaluationToolNodeDTO>>(
      `/evaluation/nodes`,
      payload
    );
  },
  updateNode(id: string, payload: UpdateNodePayload) {
    return api.put<ApiResponse<EvaluationToolNodeDTO>>(
      `/evaluation/nodes/${id}`,
      payload
    );
  },
  deleteNode(id: string) {
    return api.delete<ApiResponse>(`/evaluation/nodes/${id}`);
  },
  reorderChildren(parentId: string, orderedChildIds: string[]) {
    return api.post<ApiResponse>(`/evaluation/nodes/${parentId}/reorder`, {
      orderedChildIds,
    });
  },

  // 选项
  addOption(nodeId: string, payload: CreateOptionPayload) {
    return api.post<ApiResponse>(
      `/evaluation/nodes/${nodeId}/options`,
      payload
    );
  },
  updateOption(id: string, payload: UpdateOptionPayload) {
    return api.put<ApiResponse>(`/evaluation/options/${id}`, payload);
  },
  deleteOption(id: string) {
    return api.delete<ApiResponse>(`/evaluation/options/${id}`);
  },
  listOptions(nodeId: string) {
    return api.get<ApiResponse>(`/evaluation/nodes/${nodeId}/options`);
  },
};
