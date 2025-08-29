import api from "../../../../services/api";

export interface DomainPayload {
  moduleId?: string;
  name: string;
  hasStages?: boolean;
}

export const DomainsService = {
  async list(moduleId?: string) {
    const res = await api.get("/assessment/domains", { params: { moduleId } });
    return res.data.items as Array<any>;
  },
  async create(
    payload: Required<Pick<DomainPayload, "moduleId">> &
      Pick<DomainPayload, "name" | "hasStages">
  ) {
    const res = await api.post("/assessment/domains", payload);
    return res.data.domain as any;
  },
  async update(id: string, payload: Pick<DomainPayload, "name" | "hasStages">) {
    const res = await api.put(`/assessment/domains/${id}`, payload);
    return res.data.domain as any;
  },
  async remove(id: string) {
    const res = await api.delete(`/assessment/domains/${id}`);
    return res.data;
  },
};
