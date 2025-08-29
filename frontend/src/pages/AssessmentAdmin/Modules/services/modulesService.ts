import api from "../../../../services/api";

export interface ModulePayload {
  toolId?: string;
  name: string;
}

export const ModulesService = {
  async list(toolId?: string) {
    const res = await api.get("/assessment/modules", { params: { toolId } });
    return res.data.items as Array<any>;
  },
  async create(
    payload: Required<Pick<ModulePayload, "toolId">> &
      Pick<ModulePayload, "name">
  ) {
    const res = await api.post("/assessment/modules", payload);
    return res.data.module as any;
  },
  async update(id: string, payload: Pick<ModulePayload, "name">) {
    const res = await api.put(`/assessment/modules/${id}`, payload);
    return res.data.module as any;
  },
  async remove(id: string) {
    const res = await api.delete(`/assessment/modules/${id}`);
    return res.data;
  },
};
