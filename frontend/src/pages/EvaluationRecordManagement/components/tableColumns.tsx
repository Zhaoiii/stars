import React from "react";
import { TableColumnsType, Button, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  EvaluationRecord,
  Student,
  TreeNode,
} from "../../../types/evaluationRecord";

interface TableColumnsProps {
  onView: (record: EvaluationRecord) => void;
  students: Student[];
  tools: TreeNode[];
}

export const getTableColumns = ({
  onView,
  students,
  tools,
}: TableColumnsProps): TableColumnsType<EvaluationRecord> => [
  {
    title: "学生姓名",
    dataIndex: "studentId",
    key: "studentId",
    width: 120,
    render: (studentId: string | Student) => {
      if (typeof studentId === "string") {
        const student = students.find((s) => s._id === studentId);
        return student?.name || "未知学生";
      }
      return studentId.name;
    },
  },
  {
    title: "评估工具",
    dataIndex: "toolId",
    key: "toolId",
    width: 150,
    render: (toolId: string | TreeNode) => {
      if (typeof toolId === "string") {
        const tool = tools.find((t) => t._id === toolId);
        return tool?.name || "未知工具";
      }
      return toolId.name;
    },
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: string) => {
      const statusConfig = {
        in_progress: { color: "processing", text: "进行中" },
        completed: { color: "success", text: "已完成" },
        archived: { color: "default", text: "已归档" },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || {
        color: "default",
        text: status,
      };
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  {
    title: "完成进度",
    dataIndex: "evaluationScores",
    key: "progress",
    width: 120,
    render: (scores: any[]) => {
      const leafScores = scores.filter((score) => score.isLeaf);
      const totalTarget = leafScores.reduce(
        (sum, score) => sum + (score.targetCount || 0),
        0
      );
      const totalCompleted = leafScores.reduce(
        (sum, score) => sum + (score.completedCount || 0),
        0
      );
      const progress =
        totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
      return (
        <Tooltip title={`${totalCompleted}/${totalTarget}`}>
          <span>{progress}%</span>
        </Tooltip>
      );
    },
  },
  {
    title: "评估时间",
    dataIndex: "evaluatedAt",
    key: "evaluatedAt",
    width: 120,
    render: (date: string) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("zh-CN");
    },
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 120,
    render: (date: string) => new Date(date).toLocaleDateString("zh-CN"),
  },
  {
    title: "操作",
    key: "action",
    width: 100,
    fixed: "right",
    render: (_, record: EvaluationRecord) => (
      <Button
        type="link"
        icon={<EyeOutlined />}
        onClick={() => onView(record)}
        size="small"
      >
        查看
      </Button>
    ),
  },
];
