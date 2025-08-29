import api from "../../../../services/api";

export interface ItemPayload {
  stageId?: string;
  domainId?: string;
  name: string;
  description?: string;
  scoreType: "pass_fail" | "scale" | "custom";
  scoreConfig?: {
    maxScore?: number;
    passScore?: number;
    scaleLevels?: string[];
    customScoring?: boolean;
  };
  isRequired?: boolean;
  order?: number;
}

export const ItemsService = {
  async list(stageId?: string, domainId?: string) {
    const params: any = {};
    if (stageId) params.stageId = stageId;
    if (domainId) params.domainId = domainId;
    
    const res = await api.get("/assessment/items", { params });
    return res.data.items as Array<any>;
  },
  
  async create(payload: ItemPayload) {
    const res = await api.post("/assessment/items", payload);
    return res.data.item as any;
  },
  
  async update(id: string, payload: Partial<ItemPayload>) {
    const res = await api.put(`/assessment/items/${id}`, payload);
    return res.data.item as any;
  },
  
  async remove(id: string) {
    const res = await api.delete(`/assessment/items/${id}`);
    return res.data;
  }
};
