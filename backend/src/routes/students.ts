import { Router } from "express";
import { body, query } from "express-validator";
import { auth, adminAuth } from "../middleware/auth";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../controllers/studentController";

const router = Router();

const studentValidation = [
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("姓名长度必须在2-50个字符之间"),
  body("gender").isIn(["male", "female"]).withMessage("性别必须是male或female"),
  body("birthDate").isISO8601().withMessage("出生日期必须是有效的ISO日期格式"),
];

const searchValidation = [
  query("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("性别必须是male或female"),
  query("minAge")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("最小年龄必须是0-150之间的整数"),
  query("maxAge")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("最大年龄必须是0-150之间的整数"),
];

// 获取学生列表（需要登录）
router.get("/", auth, getAllStudents);

// 搜索学生（需要登录）
router.get("/search", auth, searchValidation, searchStudents);

// 获取学生详情（需要登录）
router.get("/:studentId", auth, getStudentById);

// 创建学生（需要管理员权限）
router.post("/", auth, adminAuth, studentValidation, createStudent);

// 更新学生信息（需要管理员权限）
router.put("/:studentId", auth, adminAuth, studentValidation, updateStudent);

// 删除学生（需要管理员权限）
router.delete("/:studentId", auth, adminAuth, deleteStudent);

export default router;
