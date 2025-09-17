import api, { PaginatedResponse } from "./api";
import {
  Team,
  CreateTeamData,
  UpdateTeamData,
  TeamSearchParams,
  TeamStats,
} from "../types/team";

export const teamService = {
  // 获取所有团队
  async getAllTeams(): Promise<Team[]> {
    const response = await api.get("/teams");
    return response.data.data;
  },

  // 搜索团队
  async searchTeams(params: TeamSearchParams) {
    const response = await api.get<PaginatedResponse<Team>>("/teams/search", {
      params,
    });
    return response.data;
  },

  // 根据ID获取团队
  async getTeamById(id: number): Promise<Team> {
    const response = await api.get(`/teams/${id}`);
    return response.data.data;
  },

  // 创建团队
  async createTeam(data: CreateTeamData): Promise<Team> {
    const response = await api.post("/teams", data);
    return response.data.data;
  },

  // 更新团队
  async updateTeam(id: number, data: UpdateTeamData): Promise<Team> {
    const response = await api.put(`/teams/${id}`, data);
    return response.data.data;
  },

  // 删除团队
  async deleteTeam(id: number): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  // 获取团队统计信息
  async getTeamStats(id: number): Promise<TeamStats> {
    const response = await api.get(`/teams/${id}/stats`);
    return response.data.data;
  },
};
