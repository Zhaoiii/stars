import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import { body } from "express-validator";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/assessmentItemController";

const router = Router();

router.get("/", auth, adminAuth, listItems);
router.post(
  "/",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  body("scoreType").isIn(["pass_fail", "scale", "custom"]),
  createItem
);
router.put(
  "/:itemId",
  auth,
  adminAuth,
  body("name").isLength({ min: 1 }),
  body("scoreType").isIn(["pass_fail", "scale", "custom"]),
  updateItem
);
router.delete("/:itemId", auth, adminAuth, deleteItem);

export default router;
