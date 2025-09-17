import api, { ApiResponse } from "./api";
import { LoginForm, AuthResponse } from "../types/user";

export const authService = {
  async login(data: LoginForm) {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/users/login",
      data
    );
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/users/profile");
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(token: string, user: any): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
};
