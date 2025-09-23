import { Router } from "express";
import { ReportTemplateController } from "../controllers/ReportTemplateController";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const controller = new ReportTemplateController();

// 创建模板的验证 schema
const CreateTemplateSchema = z.object({
  toolId: z.string().min(1, "工具ID必填"),
  title: z.string().min(1, "模板标题必填").max(255, "标题长度不能超过255字符"),
  description: z.string().max(1000, "描述长度不能超过1000字符").optional(),
  content: z.any(), // tiptap JSON 内容
  status: z.enum(["draft", "published"]).optional(),
});

// 更新模板的验证 schema
const UpdateTemplateSchema = z.object({
  toolId: z.string().min(1, "工具ID必填").optional(),
  title: z
    .string()
    .min(1, "模板标题必填")
    .max(255, "标题长度不能超过255字符")
    .optional(),
  description: z.string().max(1000, "描述长度不能超过1000字符").optional(),
  content: z.any().optional(), // tiptap JSON 内容
  status: z.enum(["draft", "published"]).optional(),
});

// 所有路由都需要认证
router.use(authMiddleware);

// 模板管理路由
router.post("/", validateBody(CreateTemplateSchema), controller.createTemplate);

router.get("/", controller.getAllTemplates);

router.get("/:id", controller.getTemplateById);

router.get("/tool/:toolId", controller.getTemplateByToolId);

router.put(
  "/:id",
  validateBody(UpdateTemplateSchema),
  controller.updateTemplate
);

router.delete("/:id", controller.deleteTemplate);

router.post("/:id/publish", controller.publishTemplate);

router.post("/:id/unpublish", controller.unpublishTemplate);

export default router;
