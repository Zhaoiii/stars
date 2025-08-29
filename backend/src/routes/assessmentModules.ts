import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import { body } from "express-validator";
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/assessmentModuleController";

const router = Router();

router.get("/", auth, adminAuth, listModules);
router.post(
  "/",
  auth,
  adminAuth,
  body("toolId").isLength({ min: 1 }),
  body("name").isLength({ min: 1 }),
  createModule
);
router.put(
  "/:moduleId",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  updateModule
);
router.delete("/:moduleId", auth, adminAuth, deleteModule);

export default router;
