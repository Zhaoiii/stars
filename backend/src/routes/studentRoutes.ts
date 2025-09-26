import { Router } from "express";
import { StudentController } from "../controllers/studentController";
import { authMiddleware, requireTeacherOrAdmin } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  SearchStudentsSchema,
  AssignTeachersSchema,
} from "../schemas/studentSchemas";

const router = Router();
const studentController = new StudentController();

// 所有学生路由都需要教师或管理员权限
router.use(authMiddleware, requireTeacherOrAdmin);

// 创建学生
router.post(
  "/",
  validate(CreateStudentSchema),
  studentController.createStudent
);

// 搜索学生
router.get(
  "/search",
  validate(SearchStudentsSchema),
  studentController.searchStudents
);

// 根据ID获取学生
router.get("/:id", studentController.getStudentById);

// 更新学生
router.put(
  "/:id",
  validate(UpdateStudentSchema),
  studentController.updateStudent
);

// 删除学生
router.delete("/:id", studentController.deleteStudent);

// 获取学生的教师列表
router.get("/:id/teachers", studentController.getStudentTeachers);

// 为学生分配教师
router.post(
  "/:id/assign-teachers",
  validate(AssignTeachersSchema),
  studentController.assignTeachers
);

// 获取团队学生统计
router.get("/team/:teamId/stats", studentController.getTeamStudentStats);

export default router;
