import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { User, CreateUserForm, UpdateUserForm } from "../../../types/user";
import { SearchFilters } from "../components/UserSearch";
import UserService from "../../../services/userService";
import { PaginatedRequest } from "@/services/api";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const userList = await UserService.getAllUsers();
      console.log(userList);
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error: any) {
      message.error(error.response?.data?.message || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索和筛选用户
  const searchUsers = useCallback(
    async (filters: PaginatedRequest<SearchFilters>) => {
      try {
        setLoading(true);
        setSearchFilters(filters);

        const searchParams = {
          keyword: filters.keyword,
          role: filters.role,
          status: filters.status,
          page: 1,
          pageSize: 20,
        };

        const result = await UserService.searchUsers(searchParams);
        setFilteredUsers(result.data || []);
      } catch (error: any) {
        message.error(error.response?.data?.message || "搜索用户失败");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 重置搜索
  const resetSearch = useCallback(() => {
    setSearchFilters({});
    setFilteredUsers(users);
  }, [users]);

  // 创建用户
  const createUser = useCallback(async (userData: CreateUserForm) => {
    try {
      const newUser = await UserService.createUser(userData);
      setUsers((prev) => [newUser, ...prev]);
      setFilteredUsers((prev) => [newUser, ...prev]);
      message.success("用户创建成功");
      return newUser;
    } catch (error: any) {
      message.error(error.response?.data?.message || "创建用户失败");
      throw error;
    }
  }, []);

  // 更新用户
  const updateUser = useCallback(
    async (id: number, userData: UpdateUserForm) => {
      try {
        const updatedUser = await UserService.updateUser(id, userData);
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user))
        );
        setFilteredUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user))
        );
        message.success("用户更新成功");
        return updatedUser;
      } catch (error: any) {
        message.error(error.response?.data?.message || "更新用户失败");
        throw error;
      }
    },
    []
  );

  // 删除用户
  const deleteUser = useCallback(async (id: number) => {
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
      message.success("用户删除成功");
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除用户失败");
      throw error;
    }
  }, []);

  // 获取用户详情
  const getUserById = useCallback(async (id: number) => {
    try {
      const user = await UserService.getUserById(id);
      setSelectedUser(user);
      return user;
    } catch (error: any) {
      message.error(error.response?.data?.message || "获取用户详情失败");
      throw error;
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    filteredUsers,
    loading,
    selectedUser,
    searchFilters,
    setSelectedUser,
    fetchUsers,
    searchUsers,
    resetSearch,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
  };
};
