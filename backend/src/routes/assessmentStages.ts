import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import { body } from "express-validator";
import {
  listStages,
  createStage,
  updateStage,
  deleteStage,
} from "../controllers/assessmentStageController";

const router = Router();

router.get("/", auth, adminAuth, listStages);
router.post(
  "/",
  auth,
  adminAuth,
  body("domainId").isLength({ min: 1 }),
  body("name").isLength({ min: 1 }),
  createStage
);
router.put(
  "/:stageId",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  updateStage
);
router.delete("/:stageId", auth, adminAuth, deleteStage);

export default router;
