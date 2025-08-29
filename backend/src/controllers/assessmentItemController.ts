import { Request, Response } from "express";
import mongoose from "mongoose";
import { AssessmentItem } from "../models/AssessmentItem";

export const listItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stageId, domainId } = req.query as any;
    const filter: any = {};
    
    if (stageId) {
      if (!mongoose.Types.ObjectId.isValid(stageId)) {
        res.status(400).json({ message: "stageId 无效" });
        return;
      }
      filter.stageId = stageId;
    } else if (domainId) {
      if (!mongoose.Types.ObjectId.isValid(domainId)) {
        res.status(400).json({ message: "domainId 无效" });
        return;
      }
      filter.domainId = domainId;
    }
    
    const items = await AssessmentItem.find(filter).sort({ order: 1, updatedAt: -1 });
    res.json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取测试项失败", error: (error as Error).message });
  }
};

export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stageId, domainId, name, description, scoreType, scoreConfig, isRequired, order } = req.body as {
      stageId?: string;
      domainId?: string;
      name?: string;
      description?: string;
      scoreType?: "pass_fail" | "scale" | "custom";
      scoreConfig?: any;
      isRequired?: boolean;
      order?: number;
    };

    // 验证挂靠关系
    if (!stageId && !domainId) {
      res.status(400).json({ message: "必须指定 stageId 或 domainId" });
      return;
    }
    if (stageId && domainId) {
      res.status(400).json({ message: "不能同时指定 stageId 和 domainId" });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ message: "名称必填" });
      return;
    }

    // 验证评分配置
    if (scoreType === "scale" && (!scoreConfig?.scaleLevels || scoreConfig.scaleLevels.length === 0)) {
      res.status(400).json({ message: "选择好中差评分时必须设置等级" });
      return;
    }

    if (scoreType === "custom" && (!scoreConfig?.maxScore || scoreConfig.maxScore < 1)) {
      res.status(400).json({ message: "选择自定义记分时必须设置最大分数" });
      return;
    }

    // 检查重名
    const exists = await AssessmentItem.findOne({
      $or: [
        { stageId, name: name.trim() },
        { domainId, name: name.trim() }
      ]
    });
    
    if (exists) {
      res.status(409).json({ message: "同名测试项已存在" });
      return;
    }

    const created = await AssessmentItem.create({
      stageId,
      domainId,
      name: name.trim(),
      description: description?.trim(),
      scoreType: scoreType || "pass_fail",
      scoreConfig,
      isRequired: isRequired !== undefined ? isRequired : true,
      order: order || 0
    });
    
    res.status(201).json({ item: created });
  } catch (error) {
    res
      .status(500)
      .json({ message: "创建失败", error: (error as Error).message });
  }
};

export const updateItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { name, description, scoreType, scoreConfig, isRequired, order } = req.body as {
      name?: string;
      description?: string;
      scoreType?: "pass_fail" | "scale" | "custom";
      scoreConfig?: any;
      isRequired?: boolean;
      order?: number;
    };

    // 验证评分配置
    if (scoreType === "scale" && (!scoreConfig?.scaleLevels || scoreConfig.scaleLevels.length === 0)) {
      res.status(400).json({ message: "选择好中差评分时必须设置等级" });
      return;
    }

    if (scoreType === "custom" && (!scoreConfig?.maxScore || scoreConfig.maxScore < 1)) {
      res.status(400).json({ message: "选择自定义记分时必须设置最大分数" });
      return;
    }

    const item = await AssessmentItem.findByIdAndUpdate(
      itemId,
      { name, description, scoreType, scoreConfig, isRequired, order },
      { new: true }
    );
    
    if (!item) {
      res.status(404).json({ message: "测试项不存在" });
      return;
    }
    
    res.json({ item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "更新失败", error: (error as Error).message });
  }
};

export const deleteItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    await AssessmentItem.findByIdAndDelete(itemId);
    res.json({ message: "删除成功" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "删除失败", error: (error as Error).message });
  }
};
