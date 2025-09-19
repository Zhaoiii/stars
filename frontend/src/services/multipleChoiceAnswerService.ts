import api, { ApiResponse } from "./api";
import {
  CreateMultipleChoiceAnswerPayload,
  MultipleChoiceAnswerDTO,
  UpdateMultipleChoiceAnswerPayload,
  QueryMultipleChoiceAnswerParams,
} from "@/types/multipleChoiceAnswer";

export const MultipleChoiceAnswerAPI = {
  // 多选答案管理
  createAnswer(payload: CreateMultipleChoiceAnswerPayload) {
    return api.post<ApiResponse<MultipleChoiceAnswerDTO>>(
      "/multiple-choice-answers",
      payload
    );
  },
  getAllAnswers() {
    return api.get<ApiResponse<MultipleChoiceAnswerDTO[]>>(
      "/multiple-choice-answers"
    );
  },
  getAnswersByQuery(params: QueryMultipleChoiceAnswerParams) {
    return api.get<ApiResponse<MultipleChoiceAnswerDTO[]>>(
      "/multiple-choice-answers/query",
      { params }
    );
  },
  getAnswersByToolId(toolId: string) {
    return api.get<ApiResponse<MultipleChoiceAnswerDTO[]>>(
      `/multiple-choice-answers/tool/${toolId}`
    );
  },
  getAnswersByLongTermGoalId(longTermGoalId: string) {
    return api.get<ApiResponse<MultipleChoiceAnswerDTO[]>>(
      `/multiple-choice-answers/long-term-goal/${longTermGoalId}`
    );
  },
  getAnswerById(id: string) {
    return api.get<ApiResponse<MultipleChoiceAnswerDTO>>(
      `/multiple-choice-answers/${id}`
    );
  },
  updateAnswer(id: string, payload: UpdateMultipleChoiceAnswerPayload) {
    return api.put<ApiResponse<MultipleChoiceAnswerDTO>>(
      `/multiple-choice-answers/${id}`,
      payload
    );
  },
  deleteAnswer(id: string) {
    return api.delete<ApiResponse>(`/multiple-choice-answers/${id}`);
  },
  // 批量操作
  createAnswers(answers: CreateMultipleChoiceAnswerPayload[]) {
    return api.post<ApiResponse<MultipleChoiceAnswerDTO[]>>(
      "/multiple-choice-answers/batch",
      { answers }
    );
  },
  deleteAnswersByToolAndGoal(toolId: string, longTermGoalId: string) {
    return api.delete<ApiResponse<{ deletedCount: number }>>(
      `/multiple-choice-answers/tool/${toolId}/long-term-goal/${longTermGoalId}`
    );
  },
};
