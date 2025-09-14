import express from "express";
import {
  getAssistanceTypes,
  createAssistanceType,
  updateAssistanceType,
  deleteAssistanceType,
} from "../controllers/assistanceTypeController";

const router = express.Router();

// 获取所有活跃的辅助类型
router.get("/", getAssistanceTypes);

// 创建新的辅助类型
router.post("/", createAssistanceType);

// 更新辅助类型
router.put("/:id", updateAssistanceType);

// 删除辅助类型
router.delete("/:id", deleteAssistanceType);

export default router;
