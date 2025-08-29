import { Request, Response } from "express";
import mongoose from "mongoose";
import { AssessmentModule } from "../models/AssessmentModule";

export const listModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { toolId } = req.query as any;
    const filter: any = {};
    if (toolId) {
      if (!mongoose.Types.ObjectId.isValid(toolId)) {
        res.status(400).json({ message: "toolId 无效" });
        return;
      }
      filter.toolId = toolId;
    }
    const items = await AssessmentModule.find(filter).sort({ updatedAt: -1 });
    res.json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取模块失败", error: (error as Error).message });
  }
};

export const createModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { toolId, name } = req.body as { toolId?: string; name?: string };
    if (!toolId || !mongoose.Types.ObjectId.isValid(toolId)) {
      res.status(400).json({ message: "toolId 无效" });
      return;
    }
    if (!name || !name.trim()) {
      res.status(400).json({ message: "名称必填" });
      return;
    }
    const exists = await AssessmentModule.findOne({
      toolId,
      name: name.trim(),
    });
    if (exists) {
      res.status(409).json({ message: "同名模块已存在" });
      return;
    }
    const created = await AssessmentModule.create({
      toolId,
      name: name.trim(),
    });
    res.status(201).json({ module: created });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建失败", error: (error as Error).message });
  }
};

export const updateModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { name } = req.body as { name?: string };
    const mod = await AssessmentModule.findByIdAndUpdate(
      moduleId,
      { name },
      { new: true }
    );
    if (!mod) {
      res.status(404).json({ message: "模块不存在" });
      return;
    }
    res.json({ module: mod });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新失败", error: (error as Error).message });
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    await AssessmentModule.findByIdAndDelete(moduleId);
    res.json({ message: "删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除失败", error: (error as Error).message });
  }
};
