import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import { body } from "express-validator";
import {
  listDomains,
  createDomain,
  updateDomain,
  deleteDomain,
} from "../controllers/assessmentDomainController";

const router = Router();

router.get("/", auth, adminAuth, listDomains);
router.post(
  "/",
  auth,
  adminAuth,
  body("moduleId").isLength({ min: 1 }),
  body("name").isLength({ min: 1 }),
  createDomain
);
router.put(
  "/:domainId",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  updateDomain
);
router.delete("/:domainId", auth, adminAuth, deleteDomain);

export default router;
