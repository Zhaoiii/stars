import api from "./api";
import {
  EvaluationRecord,
  EvaluationRecordFilter,
  ApiResponse,
} from "../types/evaluationRecord";

export const evaluationRecordAPI = {
  // 获取评估记录列表
  getEvaluationRecords: (params?: EvaluationRecordFilter) => {
    return api.get<ApiResponse<EvaluationRecord[]>>("/evaluation-records", {
      params,
    });
  },

  // 获取单个评估记录
  getEvaluationRecord: (id: string) => {
    return api.get<ApiResponse<EvaluationRecord>>(`/evaluation-records/${id}`);
  },

  // 创建评估记录
  createEvaluationRecord: (data: { studentId: string; toolId: string }) => {
    return api.post<ApiResponse<EvaluationRecord>>("/evaluation-records", data);
  },

  // 更新评估记录
  updateEvaluationRecord: (id: string, data: Partial<EvaluationRecord>) => {
    return api.put<ApiResponse<EvaluationRecord>>(
      `/evaluation-records/${id}`,
      data
    );
  },

  // 更新节点得分
  updateNodeScore: (
    id: string,
    nodeId: string,
    data: { completedCount: number }
  ) => {
    return api.patch<ApiResponse<EvaluationRecord>>(
      `/evaluation-records/${id}/nodes/${nodeId}`,
      data
    );
  },

  // 完成评估
  completeEvaluation: (id: string) => {
    return api.patch<ApiResponse<EvaluationRecord>>(
      `/evaluation-records/${id}/complete`
    );
  },

  // 删除评估记录
  deleteEvaluationRecord: (id: string) => {
    return api.delete<ApiResponse<void>>(`/evaluation-records/${id}`);
  },

  // 根据学生获取评估记录
  getEvaluationRecordsByStudent: (studentId: string) => {
    return api.get<ApiResponse<EvaluationRecord[]>>(
      `/evaluation-records/student/${studentId}`
    );
  },

  // 根据工具获取评估记录
  getEvaluationRecordsByTool: (toolId: string) => {
    return api.get<ApiResponse<EvaluationRecord[]>>(
      `/evaluation-records/tool/${toolId}`
    );
  },
};
