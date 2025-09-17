import { Repository, Like } from "typeorm";
import { AppDataSource } from "../config/database";
import { Team } from "../entities/Team";

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface SearchParams {
  keyword?: string;
  page: number;
  limit: number;
}

export interface SearchResult {
  teams: Team[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class TeamService {
  private teamRepository: Repository<Team>;

  constructor() {
    this.teamRepository = AppDataSource.getRepository(Team);
  }

  // 创建团队
  async createTeam(teamData: CreateTeamData): Promise<Team> {
    const existingTeam = await this.teamRepository.findOne({
      where: { name: teamData.name },
    });

    if (existingTeam) {
      throw new Error("团队名称已存在");
    }

    const team = this.teamRepository.create(teamData);
    return await this.teamRepository.save(team);
  }

  // 获取所有团队
  async getAllTeams(): Promise<Team[]> {
    return await this.teamRepository.find({
      relations: ["users"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据ID获取团队
  async getTeamById(id: number): Promise<Team | null> {
    return await this.teamRepository.findOne({
      where: { id },
      relations: ["users"],
    });
  }

  // 更新团队
  async updateTeam(id: number, teamData: UpdateTeamData): Promise<Team | null> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      return null;
    }

    // 如果更新团队名称，检查是否已存在
    if (teamData.name && teamData.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({
        where: { name: teamData.name },
      });

      if (existingTeam) {
        throw new Error("团队名称已存在");
      }
    }

    Object.assign(team, teamData);
    return await this.teamRepository.save(team);
  }

  // 删除团队
  async deleteTeam(id: number): Promise<boolean> {
    const result = await this.teamRepository.delete(id);
    return result.affected !== 0;
  }

  // 搜索团队
  async searchTeams(params: SearchParams): Promise<SearchResult> {
    const { keyword, page, limit } = params;
    const skip = (page - 1) * limit;

    let whereConditions: any = {};

    // 关键词搜索
    if (keyword) {
      whereConditions = [
        { name: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) },
      ];
    }

    const [teams, total] = await this.teamRepository.findAndCount({
      where: keyword ? whereConditions : {},
      relations: ["users"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      teams,
      page,
      limit,
      total,
      totalPages,
    };
  }

  // 获取团队统计信息
  async getTeamStats(
    id: number
  ): Promise<{ memberCount: number; managerTeachers: any[] }> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ["users", "users.team"],
    });

    if (!team) {
      throw new Error("团队不存在");
    }

    const memberCount = team.users?.length || 0;
    // 获取团队内的管理教师
    const managerTeachers =
      team.users?.filter((user) => user.role === "manager_teacher") || [];

    return {
      memberCount,
      managerTeachers: managerTeachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name || teacher.username,
        username: teacher.username,
        email: teacher.email,
      })),
    };
  }
}
