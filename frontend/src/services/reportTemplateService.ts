import api, { ApiResponse } from "./api";

export interface ReportTemplateDTO {
  id: string;
  toolId: string;
  tool: {
    id: string;
    title: string;
  };
  title: string;
  description?: string | null;
  content: any; // tiptap JSON 内容
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  toolId: string;
  title: string;
  description?: string | null;
  content: any;
  status?: "draft" | "published";
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}

export const ReportTemplateAPI = {
  // 获取所有模板
  getAll() {
    return api.get<ApiResponse<ReportTemplateDTO[]>>("/report-templates");
  },

  // 根据ID获取模板
  getById(id: string) {
    return api.get<ApiResponse<ReportTemplateDTO>>(`/report-templates/${id}`);
  },

  // 根据工具ID获取模板
  getByToolId(toolId: string) {
    return api.get<ApiResponse<ReportTemplateDTO>>(
      `/report-templates/tool/${toolId}`
    );
  },

  // 创建模板
  create(payload: CreateTemplatePayload) {
    return api.post<ApiResponse<ReportTemplateDTO>>(
      "/report-templates",
      payload
    );
  },

  // 更新模板
  update(id: string, payload: UpdateTemplatePayload) {
    return api.put<ApiResponse<ReportTemplateDTO>>(
      `/report-templates/${id}`,
      payload
    );
  },

  // 删除模板
  delete(id: string) {
    return api.delete<ApiResponse<null>>(`/report-templates/${id}`);
  },

  // 发布模板
  publish(id: string) {
    return api.post<ApiResponse<ReportTemplateDTO>>(
      `/report-templates/${id}/publish`
    );
  },

  // 取消发布模板
  unpublish(id: string) {
    return api.post<ApiResponse<ReportTemplateDTO>>(
      `/report-templates/${id}/unpublish`
    );
  },
};
