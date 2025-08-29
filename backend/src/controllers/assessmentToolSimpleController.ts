import { Request, Response } from "express";
import { AssessmentTool } from "../models/AssessmentTool";

export const listTools = async (req: Request, res: Response): Promise<void> => {
  try {
    const tools = await AssessmentTool.find({}).sort({ updatedAt: -1 });
    res.json({ items: tools });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取工具失败", error: (error as Error).message });
  }
};

export const createTool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ message: "名称必填" });
      return;
    }
    const exists = await AssessmentTool.findOne({ name: name.trim() });
    if (exists) {
      res.status(409).json({ message: "该工具已存在" });
      return;
    }
    const tool = await AssessmentTool.create({ name: name.trim() });
    res.status(201).json({ tool });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建失败", error: (error as Error).message });
  }
};

export const updateTool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { toolId } = req.params;
    const { name } = req.body as { name?: string };
    const tool = await AssessmentTool.findByIdAndUpdate(
      toolId,
      { name },
      { new: true }
    );
    if (!tool) {
      res.status(404).json({ message: "工具不存在" });
      return;
    }
    res.json({ tool });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新失败", error: (error as Error).message });
  }
};

export const deleteTool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { toolId } = req.params;
    await AssessmentTool.findByIdAndDelete(toolId);
    res.json({ message: "删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除失败", error: (error as Error).message });
  }
};
