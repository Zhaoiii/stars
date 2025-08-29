import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController";

const router = Router();

const registerValidation = [
  body("username")
    .isLength({ min: 2, max: 50 })
    .withMessage("用户名长度必须在2-50个字符之间"),
  body("phone")
    .matches(/^1[3-9]\d{9}$/)
    .withMessage("请输入有效的手机号"),
  body("password").isLength({ min: 6 }).withMessage("密码长度至少6个字符"),
];

const loginValidation = [
  body("phone")
    .matches(/^1[3-9]\d{9}$/)
    .withMessage("请输入有效的手机号"),
  body("password").notEmpty().withMessage("密码不能为空"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

export default router;
