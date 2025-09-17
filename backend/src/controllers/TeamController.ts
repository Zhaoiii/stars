import { Request, Response } from "express";
import {
  TeamService,
  CreateTeamData,
  UpdateTeamData,
} from "../services/TeamService";
import { ResponseUtil } from "../utils/response";
import {
  CreateTeamInput,
  UpdateTeamInput,
  SearchTeamsInput,
} from "../schemas/teamSchemas";

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  // 创建团队
  createTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const teamData: CreateTeamInput = req.body;
      const team = await this.teamService.createTeam(
        teamData as CreateTeamData
      );

      ResponseUtil.success(res, team, "团队创建成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建团队失败",
        400
      );
    }
  };

  // 获取所有团队
  getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const teams = await this.teamService.getAllTeams();
      ResponseUtil.success(res, teams, "获取团队列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取团队列表失败");
    }
  };

  // 搜索团队
  searchTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchParams: SearchTeamsInput =
        req.query as unknown as SearchTeamsInput;

      const result = await this.teamService.searchTeams({
        keyword: searchParams.keyword,
        page: searchParams.page,
        limit: searchParams.pageSize,
      });

      ResponseUtil.successPaginated(
        res,
        result.teams,
        result.page,
        result.limit,
        result.total,
        "搜索团队成功"
      );
    } catch (error) {
      ResponseUtil.error(res, "搜索团队失败");
    }
  };

  // 根据ID获取团队
  getTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const team = await this.teamService.getTeamById(id);

      if (!team) {
        ResponseUtil.notFound(res, "团队不存在");
        return;
      }

      ResponseUtil.success(res, team, "获取团队信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取团队信息失败");
    }
  };

  // 更新团队
  updateTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const teamData: UpdateTeamInput = req.body;

      const team = await this.teamService.updateTeam(
        id,
        teamData as UpdateTeamData
      );

      if (!team) {
        ResponseUtil.notFound(res, "团队不存在");
        return;
      }

      ResponseUtil.success(res, team, "团队更新成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新团队失败",
        400
      );
    }
  };

  // 删除团队
  deleteTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const success = await this.teamService.deleteTeam(id);

      if (!success) {
        ResponseUtil.notFound(res, "团队不存在");
        return;
      }

      ResponseUtil.success(res, null, "团队删除成功");
    } catch (error) {
      ResponseUtil.error(res, "删除团队失败");
    }
  };

  // 获取团队统计信息
  getTeamStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const stats = await this.teamService.getTeamStats(id);

      ResponseUtil.success(res, stats, "获取团队统计信息成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "获取团队统计信息失败",
        400
      );
    }
  };
}
