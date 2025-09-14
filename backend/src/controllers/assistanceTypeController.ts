import { Request, Response } from "express";
import AssistanceType from "../models/AssistanceType";

export const getAssistanceTypes = async (req: Request, res: Response) => {
  try {
    const types = await AssistanceType.getActiveTypes();
    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("获取辅助类型失败:", error);
    res.status(500).json({
      success: false,
      message: "获取辅助类型失败",
    });
  }
};

export const createAssistanceType = async (req: Request, res: Response) => {
  try {
    const { name, code, description, sortOrder } = req.body;
    
    const assistanceType = new AssistanceType({
      name,
      code: code.toUpperCase(),
      description,
      sortOrder: sortOrder || 0,
    });
    
    await assistanceType.save();
    
    res.status(201).json({
      success: true,
      data: assistanceType,
      message: "辅助类型创建成功",
    });
  } catch (error) {
    console.error("创建辅助类型失败:", error);
    res.status(500).json({
      success: false,
      message: "创建辅助类型失败",
    });
  }
};

export const updateAssistanceType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    const assistanceType = await AssistanceType.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!assistanceType) {
      return res.status(404).json({
        success: false,
        message: "辅助类型不存在",
      });
    }
    
    res.json({
      success: true,
      data: assistanceType,
      message: "辅助类型更新成功",
    });
  } catch (error) {
    console.error("更新辅助类型失败:", error);
    res.status(500).json({
      success: false,
      message: "更新辅助类型失败",
    });
  }
};

export const deleteAssistanceType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const assistanceType = await AssistanceType.findByIdAndDelete(id);
    
    if (!assistanceType) {
      return res.status(404).json({
        success: false,
        message: "辅助类型不存在",
      });
    }
    
    res.json({
      success: true,
      message: "辅助类型删除成功",
    });
  } catch (error) {
    console.error("删除辅助类型失败:", error);
    res.status(500).json({
      success: false,
      message: "删除辅助类型失败",
    });
  }
};
