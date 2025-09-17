import api, {
  ApiResponse,
  PaginatedRequest,
  PaginatedResponse,
} from "@/services/api";
import { User, CreateUserForm, UpdateUserForm } from "@/types/user";

export class UserService {
  // 获取所有用户
  static async getAllUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>("/users");
    return response.data.data || [];
  }

  // 根据ID获取用户
  static async getUserById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  }

  // 创建用户
  static async createUser(userData: CreateUserForm): Promise<User> {
    const response = await api.post<ApiResponse<User>>("/users", userData);
    return response.data.data!;
  }

  // 更新用户
  static async updateUser(id: number, userData: UpdateUserForm): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data!;
  }

  // 删除用户
  static async deleteUser(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/users/${id}`);
  }

  // 获取当前用户信息
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/users/profile");
    return response.data.data!;
  }

  // 搜索用户
  static async searchUsers(
    params: PaginatedRequest<{
      keyword?: string;
      role?: string;
      status?: string;
    }>
  ) {
    const response = await api.get<PaginatedResponse<User>>("/users/search", {
      params,
    });
    return response.data;
  }
}

export default UserService;
