import api from "../../../../services/api";

export interface StagePayload {
  domainId?: string;
  name: string;
}

export const StagesService = {
  async list(domainId?: string) {
    const res = await api.get("/assessment/stages", { params: { domainId } });
    return res.data.items as Array<any>;
  },
  async create(
    payload: Required<Pick<StagePayload, "domainId">> &
      Pick<StagePayload, "name">
  ) {
    const res = await api.post("/assessment/stages", payload);
    return res.data.stage as any;
  },
  async update(id: string, payload: Pick<StagePayload, "name">) {
    const res = await api.put(`/assessment/stages/${id}`, payload);
    return res.data.stage as any;
  },
  async remove(id: string) {
    const res = await api.delete(`/assessment/stages/${id}`);
    return res.data;
  },
};
