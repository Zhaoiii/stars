import { Router } from "express";
import { body } from "express-validator";
import { auth, adminAuth } from "../middleware/auth";
import {
  getProfile,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
} from "../controllers/userController";

const router = Router();

const userValidation = [
  body("username")
    .isLength({ min: 2, max: 50 })
    .withMessage("用户名长度必须在2-50个字符之间"),
  body("phone")
    .matches(/^1[3-9]\d{9}$/)
    .withMessage("请输入有效的手机号"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("密码长度至少6个字符"),
];

const roleValidation = [
  body("role").isIn(["user", "admin"]).withMessage("用户角色必须是user或admin"),
];

// 用户个人资料
router.get("/profile", auth, getProfile);

// 管理员功能
router.get("/", auth, adminAuth, getAllUsers);
router.post("/", auth, adminAuth, userValidation, createUser);
router.get("/:userId", auth, adminAuth, getUserById);
router.put("/:userId", auth, adminAuth, userValidation, updateUser);
router.patch("/:userId/role", auth, adminAuth, roleValidation, updateUserRole);
router.delete("/:userId", auth, adminAuth, deleteUser);

export default router;
