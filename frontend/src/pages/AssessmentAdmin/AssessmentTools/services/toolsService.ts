import api from "../../../../services/api";

export interface ToolPayload {
  name: string;
}

export const ToolsService = {
  async list() {
    const res = await api.get("/assessment/tools");
    return res.data.items as Array<any>;
  },
  async create(payload: ToolPayload) {
    const res = await api.post("/assessment/tools", payload);
    return res.data.tool as any;
  },
  async update(id: string, payload: ToolPayload) {
    const res = await api.put(`/assessment/tools/${id}`, payload);
    return res.data.tool as any;
  },
  async remove(id: string) {
    const res = await api.delete(`/assessment/tools/${id}`);
    return res.data;
  },
};
