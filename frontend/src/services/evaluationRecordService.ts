import api, { ApiResponse } from "./api";
import {
  EvaluationRecordDTO,
  EvaluationRecordItemDTO,
} from "@/types/evaluationRecord";

export const EvaluationRecordAPI = {
  listByStudent(studentId: string) {
    return api.get<ApiResponse<EvaluationRecordDTO[]>>(
      `/evaluation-records/students/${studentId}/records`
    );
  },
  create(payload: { studentId: string; toolId: string }) {
    return api.post<ApiResponse<EvaluationRecordDTO>>(
      `/evaluation-records/records`,
      payload
    );
  },
  start(id: string) {
    return api.post<ApiResponse<EvaluationRecordDTO>>(
      `/evaluation-records/records/${id}/start`,
      {}
    );
  },
  submit(id: string) {
    return api.post<ApiResponse<EvaluationRecordDTO>>(
      `/evaluation-records/records/${id}/submit`,
      {}
    );
  },
  getById(id: string) {
    return api.get<ApiResponse<EvaluationRecordDTO>>(
      `/evaluation-records/records/${id}`
    );
  },
  saveReportContent(id: string, content: any) {
    return api.put<ApiResponse<EvaluationRecordDTO>>(
      `/evaluation-records/records/${id}/report-content`,
      { content }
    );
  },
  listItems(id: string) {
    return api.get<ApiResponse<any[]>>(
      `/evaluation-records/records/${id}/items`
    );
  },
  upsertItem(
    id: string,
    payload: { longTermGoalId: string; answer?: any; score?: number | null }
  ) {
    return api.post<ApiResponse<EvaluationRecordItemDTO>>(
      `/evaluation-records/records/${id}/items`,
      payload
    );
  },
};
