import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("获取token失败:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      // 这里可以触发全局登出事件
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (phone: string, password: string) =>
    api.post("/auth/login", { phone, password }),

  register: (username: string, phone: string, password: string) =>
    api.post("/auth/register", { username, phone, password }),

  getProfile: () => api.get("/auth/profile"),

  logout: () => api.post("/auth/logout"),
};

// 学生相关API
export const studentAPI = {
  getStudents: () => api.get("/students"),

  getStudent: (id: string) => api.get(`/students/${id}`),

  createStudent: (studentData: any) => api.post("/students", studentData),

  updateStudent: (id: string, studentData: any) =>
    api.put(`/students/${id}`, studentData),

  deleteStudent: (id: string) => api.delete(`/students/${id}`),
};

// 用户相关API
export const userAPI = {
  getUsers: () => api.get("/users"),

  getUser: (id: string) => api.get(`/users/${id}`),

  createUser: (userData: any) => api.post("/users", userData),

  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),

  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// 树节点相关API
export const treeAPI = {
  getRoots: () => api.get("/tree-nodes/roots"),
  getStructure: () => api.get("/tree-nodes/structure"),
  getChildren: (parentId: string | null) =>
    api.get(`/tree-nodes/children/${parentId ?? "null"}`),
  getNode: (id: string) => api.get(`/tree-nodes/${id}`),
  getSubtree: (rootId: string) => api.get(`/tree-nodes/subtree/${rootId}`),
};

// 评估记录相关API
export const evaluationRecordAPI = {
  // 创建评估记录
  createEvaluationRecord: (studentId: string, toolId: string) =>
    api.post("/evaluation-records", { studentId, toolId }),

  // 获取评估记录列表
  getEvaluationRecords: (params?: {
    studentId?: string;
    toolId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get("/evaluation-records", { params }),

  // 根据ID获取评估记录
  getEvaluationRecord: (id: string) => api.get(`/evaluation-records/${id}`),

  // 更新评估记录
  updateEvaluationRecord: (id: string, data: any) =>
    api.put(`/evaluation-records/${id}`, data),

  // 更新单个节点得分
  updateNodeScore: (recordId: string, nodeId: string, data: any) =>
    api.patch(`/evaluation-records/${recordId}/nodes/${nodeId}`, data),

  // 完成评估
  completeEvaluation: (id: string) =>
    api.patch(`/evaluation-records/${id}/complete`),

  // 删除评估记录
  deleteEvaluationRecord: (id: string) =>
    api.delete(`/evaluation-records/${id}`),

  // 根据学生ID获取评估记录
  getEvaluationRecordsByStudent: (studentId: string) =>
    api.get(`/evaluation-records/student/${studentId}`),

  // 根据工具ID获取评估记录
  getEvaluationRecordsByTool: (toolId: string) =>
    api.get(`/evaluation-records/tool/${toolId}`),

  // 获取学生信息（用于显示学生姓名）
  getStudentInfo: (studentId: string) => api.get(`/students/${studentId}`),
};

export default api;
