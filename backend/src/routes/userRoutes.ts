import { Router } from "express";
import { UserController } from "../controllers/UserController";
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest,
} from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validation";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  SearchUsersSchema,
} from "../schemas/userSchemas";

const router = Router();
const userController = new UserController();

// 公开路由
router.post("/login", validateBody(LoginSchema), userController.login);

// 需要认证的路由
router.get("/profile", authenticateToken, userController.getCurrentUser);

// 需要管理员权限的路由
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateBody(CreateUserSchema),
  userController.createUser
);
router.get(
  "/search",
  authenticateToken,
  requireAdmin,
  validateQuery(SearchUsersSchema),
  userController.searchUsers
);
router.get("/", authenticateToken, requireAdmin, userController.getAllUsers);
router.get("/:id", authenticateToken, requireAdmin, userController.getUserById);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateBody(UpdateUserSchema),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  userController.deleteUser
);

export default router;
