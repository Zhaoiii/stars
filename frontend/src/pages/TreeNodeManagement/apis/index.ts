import api from "../../../services/api";

export const getTreeRoots = () => {
  return api.get("/tree-nodes/roots");
};

export const createTreeNode = (data: any) => {
  return api.post("/tree-nodes", data);
};

export const updateTreeNode = (id: string, data: any) => {
  return api.put(`/tree-nodes/${id}`, data);
};

export const deleteTreeNode = (id: string) => {
  return api.delete(`/tree-nodes/${id}`);
};
