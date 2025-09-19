import api, { ApiResponse } from "./api";
import {
  CreateShortTermGoalPayload,
  ShortTermGoalDTO,
  UpdateShortTermGoalPayload,
} from "@/types/shortTermGoal";

export const ShortTermGoalAPI = {
  // 短期目标
  createGoal(payload: CreateShortTermGoalPayload) {
    return api.post<ApiResponse<ShortTermGoalDTO>>(
      "/short-term-goals",
      payload
    );
  },
  getAllGoals() {
    return api.get<ApiResponse<ShortTermGoalDTO[]>>("/short-term-goals");
  },
  getGoalsByToolId(toolId: string) {
    return api.get<ApiResponse<ShortTermGoalDTO[]>>(
      `/short-term-goals/tool/${toolId}`
    );
  },
  getGoalsByLongTermGoalId(longTermGoalId: string) {
    return api.get<ApiResponse<ShortTermGoalDTO[]>>(
      `/short-term-goals/long-term-goal/${longTermGoalId}`
    );
  },
  getGoalById(id: string) {
    return api.get<ApiResponse<ShortTermGoalDTO>>(`/short-term-goals/${id}`);
  },
  updateGoal(id: string, payload: UpdateShortTermGoalPayload) {
    return api.put<ApiResponse<ShortTermGoalDTO>>(
      `/short-term-goals/${id}`,
      payload
    );
  },
  deleteGoal(id: string) {
    return api.delete<ApiResponse>(`/short-term-goals/${id}`);
  },
  reorderGoals(longTermGoalId: string, orderedGoalIds: string[]) {
    return api.post<ApiResponse>(
      `/short-term-goals/long-term-goal/${longTermGoalId}/reorder`,
      { orderedGoalIds }
    );
  },
};
