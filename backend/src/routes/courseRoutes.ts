import { Router } from "express";
import { CourseController } from "../controllers/CourseController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const courseController = new CourseController();

// 所有课程路由都需要认证
router.use(authMiddleware);

// 课程管理路由
router.get("/", courseController.getCourses);
router.get("/stats", courseController.getCourseStats);
router.get("/calendar", courseController.getCalendarEvents);
router.get("/:id", courseController.getCourseById);
router.post("/", courseController.createCourse);
router.post("/recurring", courseController.createRecurringCourses);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

export default router;
