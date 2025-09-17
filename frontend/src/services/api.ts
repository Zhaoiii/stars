import { notification } from "antd";
import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    notification.error({
      description: error.response?.data?.message || "something went wrong",
      message: "",
    });
    return Promise.reject(error);
  }
);

// 不分页的响应格式
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

// 分页的响应格式
export type PaginatedResponse<T = any> = {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedRequest<T> = {
  page: number;
  pageSize: number;
} & T;

export default api;
