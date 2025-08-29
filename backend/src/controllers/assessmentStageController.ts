import { Request, Response } from "express";
import mongoose from "mongoose";
import { AssessmentStage } from "../models/AssessmentStage";

export const listStages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { domainId } = req.query as any;
    const filter: any = {};
    if (domainId) {
      if (!mongoose.Types.ObjectId.isValid(domainId)) {
        res.status(400).json({ message: "domainId 无效" });
        return;
      }
      filter.domainId = domainId;
    }
    const items = await AssessmentStage.find(filter).sort({ updatedAt: -1 });
    res.json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取阶段失败", error: (error as Error).message });
  }
};

export const createStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { domainId, name } = req.body as { domainId?: string; name?: string };
    if (!domainId || !mongoose.Types.ObjectId.isValid(domainId)) {
      res.status(400).json({ message: "domainId 无效" });
      return;
    }
    if (!name || !name.trim()) {
      res.status(400).json({ message: "名称必填" });
      return;
    }
    const exists = await AssessmentStage.findOne({
      domainId,
      name: name.trim(),
    });
    if (exists) {
      res.status(409).json({ message: "同名阶段已存在" });
      return;
    }
    const created = await AssessmentStage.create({
      domainId,
      name: name.trim(),
    });
    res.status(201).json({ stage: created });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建失败", error: (error as Error).message });
  }
};

export const updateStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stageId } = req.params;
    const { name } = req.body as { name?: string };
    const st = await AssessmentStage.findByIdAndUpdate(
      stageId,
      { name },
      { new: true }
    );
    if (!st) {
      res.status(404).json({ message: "阶段不存在" });
      return;
    }
    res.json({ stage: st });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新失败", error: (error as Error).message });
  }
};

export const deleteStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stageId } = req.params;
    await AssessmentStage.findByIdAndDelete(stageId);
    res.json({ message: "删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除失败", error: (error as Error).message });
  }
};
