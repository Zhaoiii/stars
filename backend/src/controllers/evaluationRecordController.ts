import { Request, Response } from "express";
import EvaluationRecord, {
  IEvaluationRecord,
  IEvaluationScore,
} from "../models/EvaluationRecord";
import TreeNode from "../models/TreeNode";
import { Student } from "../models/Student";

// 创建评估记录
export const createEvaluationRecord = async (req: Request, res: Response) => {
  try {
    const { studentId, toolId } = req.body;

    // 验证学生是否存在
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "学生不存在",
      });
    }

    // 验证评估工具（树形根节点）是否存在
    const tool = await TreeNode.findById(toolId);
    if (!tool || !tool.isRoot) {
      return res.status(404).json({
        success: false,
        message: "评估工具不存在或不是根节点",
      });
    }

    // 检查是否已存在该学生和工具的评估记录
    const existingRecord = await EvaluationRecord.findOne({
      studentId,
      toolId,
      status: { $in: ["in_progress", "completed"] },
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "该学生已存在此评估工具的评估记录",
      });
    }

    // 获取完整的树形结构
    const treeStructure = await TreeNode.getTreeStructure();
    const targetTree = treeStructure.find(
      (tree: any) => tree._id.toString() === toolId
    );

    if (!targetTree) {
      return res.status(404).json({
        success: false,
        message: "未找到指定的树形结构",
      });
    }

    // 创建评估记录
    const evaluationRecord = await EvaluationRecord.createFromTreeStructure(
      studentId,
      toolId,
      tool.name,
      targetTree
    );

    res.status(201).json({
      success: true,
      message: "评估记录创建成功",
      data: evaluationRecord,
    });
  } catch (error) {
    console.error("创建评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "创建评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 获取所有评估记录
export const getEvaluationRecords = async (req: Request, res: Response) => {
  try {
    const { studentId, toolId, status, page = 1, limit = 10 } = req.query;

    // 构建查询条件
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (toolId) filter.toolId = toolId;
    if (status) filter.status = status;

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const evaluationRecords = await EvaluationRecord.find(filter)
      .populate("studentId", "name")
      .populate("toolId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await EvaluationRecord.countDocuments(filter);

    res.json({
      success: true,
      data: evaluationRecords,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("获取评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 根据ID获取评估记录
export const getEvaluationRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluationRecord = await EvaluationRecord.findById(id)
      .populate("studentId", "name")
      .populate("toolId", "name");

    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: "评估记录不存在",
      });
    }

    res.json({
      success: true,
      data: evaluationRecord,
    });
  } catch (error) {
    console.error("获取评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 更新评估记录
export const updateEvaluationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { evaluationScores, status } = req.body;

    const evaluationRecord = await EvaluationRecord.findById(id);
    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: "评估记录不存在",
      });
    }

    // 更新评估得分
    if (evaluationScores) {
      // 验证完成数数据
      for (const score of evaluationScores) {
        if (score.completedCount < 0) {
          return res.status(400).json({
            success: false,
            message: `节点 ${score.nodeName} 的完成数不能小于 0`,
          });
        }

        // 验证分段得分
        if (score.isLeaf && score.segmentScores) {
          for (const segment of score.segmentScores) {
            if (segment.completedCount < 0) {
              return res.status(400).json({
                success: false,
                message: `节点 ${score.nodeName} 的分段完成数不能小于 0`,
              });
            }
          }
        }
      }

      evaluationRecord.evaluationScores = evaluationScores;
    }

    // 更新状态
    if (status) {
      evaluationRecord.status = status;
      if (status === "completed") {
        evaluationRecord.evaluatedAt = new Date();
      }
    }

    await evaluationRecord.save();

    res.json({
      success: true,
      message: "评估记录更新成功",
      data: evaluationRecord,
    });
  } catch (error) {
    console.error("更新评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "更新评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 更新单个节点的得分
export const updateNodeScore = async (req: Request, res: Response) => {
  try {
    const { id, nodeId } = req.params;
    const { completedCount } = req.body;

    const evaluationRecord = await EvaluationRecord.findById(id);
    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: "评估记录不存在",
      });
    }

    // 查找要更新的节点
    const nodeIndex = evaluationRecord.evaluationScores.findIndex(
      (item) => item.nodeId === nodeId
    );

    if (nodeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "未找到指定的节点",
      });
    }

    // 更新节点完成数（只有叶子节点才能更新完成数）
    if (completedCount !== undefined) {
      if (!evaluationRecord.evaluationScores[nodeIndex].isLeaf) {
        return res.status(400).json({
          success: false,
          message: "只有叶子节点才能更新完成数",
        });
      }
      evaluationRecord.evaluationScores[nodeIndex].completedCount =
        completedCount;
    }

    await evaluationRecord.save();

    res.json({
      success: true,
      message: "节点完成数更新成功",
      data: evaluationRecord,
    });
  } catch (error) {
    console.error("更新节点完成数失败:", error);
    res.status(500).json({
      success: false,
      message: "更新节点完成数失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 删除评估记录
export const deleteEvaluationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluationRecord = await EvaluationRecord.findByIdAndDelete(id);
    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: "评估记录不存在",
      });
    }

    res.json({
      success: true,
      message: "评估记录删除成功",
    });
  } catch (error) {
    console.error("删除评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "删除评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 根据学生ID获取评估记录
export const getEvaluationRecordsByStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId } = req.params;

    const evaluationRecords = await EvaluationRecord.getByStudent(studentId);

    res.json({
      success: true,
      data: evaluationRecords,
    });
  } catch (error) {
    console.error("获取学生评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取学生评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 根据工具ID获取评估记录
export const getEvaluationRecordsByTool = async (
  req: Request,
  res: Response
) => {
  try {
    const { toolId } = req.params;

    const evaluationRecords = await EvaluationRecord.getByTool(toolId);

    res.json({
      success: true,
      data: evaluationRecords,
    });
  } catch (error) {
    console.error("获取工具评估记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取工具评估记录失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 完成评估
export const completeEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluationRecord = await EvaluationRecord.findById(id);
    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: "评估记录不存在",
      });
    }

    evaluationRecord.status = "completed";
    evaluationRecord.evaluatedAt = new Date();

    await evaluationRecord.save();

    res.json({
      success: true,
      message: "评估完成",
      data: evaluationRecord,
    });
  } catch (error) {
    console.error("完成评估失败:", error);
    res.status(500).json({
      success: false,
      message: "完成评估失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  }
};
