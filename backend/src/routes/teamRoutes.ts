import { Router } from "express";
import { TeamController } from "../controllers/TeamController";
import {
  authenticateToken,
  requireAdminOrManagerTeacher,
} from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  SearchTeamsSchema,
} from "../schemas/teamSchemas";

const router = Router();
const teamController = new TeamController();

// 所有团队路由都需要管理员或管理教师权限
router.use(authenticateToken, requireAdminOrManagerTeacher);

// 创建团队
router.post("/", validate(CreateTeamSchema), teamController.createTeam);

// 获取所有团队
router.get("/", teamController.getAllTeams);

// 搜索团队
router.get("/search", validate(SearchTeamsSchema), teamController.searchTeams);

// 根据ID获取团队
router.get("/:id", teamController.getTeamById);

// 更新团队
router.put("/:id", validate(UpdateTeamSchema), teamController.updateTeam);

// 删除团队
router.delete("/:id", teamController.deleteTeam);

// 获取团队统计信息
router.get("/:id/stats", teamController.getTeamStats);

export default router;
