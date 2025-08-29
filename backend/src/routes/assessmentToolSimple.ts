import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import { body } from "express-validator";
import {
  listTools,
  createTool,
  updateTool,
  deleteTool,
} from "../controllers/assessmentToolSimpleController";

const router = Router();

router.get("/", auth, adminAuth, listTools);
router.post(
  "/",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  createTool
);
router.put(
  "/:toolId",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  updateTool
);
router.delete("/:toolId", auth, adminAuth, deleteTool);

export default router;
