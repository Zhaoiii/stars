import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 创建axios实例
const api = axios.create({
  baseURL: "http://172.20.10.2:5001/api",
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

export default api;
