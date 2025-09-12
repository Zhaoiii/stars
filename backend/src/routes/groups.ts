import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addTeachersToGroup,
  setGroupManagers,
  addStudentsToGroup,
  removeStudentsFromGroup,
} from "../controllers/groupController";

const router = Router();

router.get("/", auth, adminAuth, getAllGroups);
router.get("/:groupId", auth, adminAuth, getGroupById);
router.post("/", auth, adminAuth, createGroup);
router.put("/:groupId", auth, adminAuth, updateGroup);
router.delete("/:groupId", auth, adminAuth, deleteGroup);

router.post("/:groupId/teachers", auth, adminAuth, addTeachersToGroup);
router.post("/:groupId/managers", auth, adminAuth, setGroupManagers);
router.post("/:groupId/students", auth, adminAuth, addStudentsToGroup);
router.delete("/:groupId/students", auth, adminAuth, removeStudentsFromGroup);

export default router;
