import { Request, Response } from "express";
import mongoose from "mongoose";
import { AssessmentDomain } from "../models/AssessmentDomain";

export const listDomains = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.query as any;
    const filter: any = {};
    if (moduleId) {
      if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        res.status(400).json({ message: "moduleId 无效" });
        return;
      }
      filter.moduleId = moduleId;
    }
    const items = await AssessmentDomain.find(filter).sort({ updatedAt: -1 });
    res.json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取领域失败", error: (error as Error).message });
  }
};

export const createDomain = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId, name, hasStages } = req.body as {
      moduleId?: string;
      name?: string;
      hasStages?: boolean;
    };
    if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
      res.status(400).json({ message: "moduleId 无效" });
      return;
    }
    if (!name || !name.trim()) {
      res.status(400).json({ message: "名称必填" });
      return;
    }
    const exists = await AssessmentDomain.findOne({
      moduleId,
      name: name.trim(),
    });
    if (exists) {
      res.status(409).json({ message: "同名领域已存在" });
      return;
    }
    const created = await AssessmentDomain.create({
      moduleId,
      name: name.trim(),
      hasStages: hasStages !== undefined ? hasStages : true,
    });
    res.status(201).json({ domain: created });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建失败", error: (error as Error).message });
  }
};

export const updateDomain = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { domainId } = req.params;
    const { name, hasStages } = req.body as {
      name?: string;
      hasStages?: boolean;
    };
    const domain = await AssessmentDomain.findByIdAndUpdate(
      domainId,
      { name, hasStages },
      { new: true }
    );
    if (!domain) {
      res.status(404).json({ message: "领域不存在" });
      return;
    }
    res.json({ domain });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新失败", error: (error as Error).message });
  }
};

export const deleteDomain = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { domainId } = req.params;
    await AssessmentDomain.findByIdAndDelete(domainId);
    res.json({ message: "删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除失败", error: (error as Error).message });
  }
};
