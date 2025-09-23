import React from "react";
import {
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export type FieldOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
  category: string;
};

export function buildFieldOptions(): FieldOption[] {
  const options: FieldOption[] = [];

  // 学生信息
  options.push(
    {
      label: "学生ID",
      value: "student.id",
      icon: <UserOutlined />,
      category: "学生信息",
    },
    {
      label: "学生姓名",
      value: "student.name",
      icon: <UserOutlined />,
      category: "学生信息",
    },
    {
      label: "团队ID",
      value: "student.team.id",
      icon: <TeamOutlined />,
      category: "学生信息",
    },
    {
      label: "团队名称",
      value: "student.team.name",
      icon: <TeamOutlined />,
      category: "学生信息",
    }
  );

  // 评估信息
  options.push(
    {
      label: "评估记录ID",
      value: "evaluation.id",
      icon: <FileTextOutlined />,
      category: "评估信息",
    },
    {
      label: "评估工具ID",
      value: "evaluation.toolId",
      icon: <FileTextOutlined />,
      category: "评估信息",
    },
    {
      label: "评估工具名称",
      value: "evaluation.toolTitle",
      icon: <FileTextOutlined />,
      category: "评估信息",
    },
    {
      label: "评估状态",
      value: "evaluation.status",
      icon: <FileTextOutlined />,
      category: "评估信息",
    },
    {
      label: "创建时间",
      value: "evaluation.createdAt",
      icon: <FileTextOutlined />,
      category: "评估信息",
    },
    {
      label: "完成时间",
      value: "evaluation.completedAt",
      icon: <FileTextOutlined />,
      category: "评估信息",
    }
  );

  // 目标信息（示例）
  options.push(
    {
      label: "目标1 ID",
      value: "goals['目标1'].id",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标1 标题",
      value: "goals['目标1'].title",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标1 分数",
      value: "goals['目标1'].score",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标1 满分",
      value: "goals['目标1'].maxScore",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标2 ID",
      value: "goals['目标2'].id",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标2 标题",
      value: "goals['目标2'].title",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标2 分数",
      value: "goals['目标2'].score",
      icon: <TrophyOutlined />,
      category: "目标信息",
    },
    {
      label: "目标2 满分",
      value: "goals['目标2'].maxScore",
      icon: <TrophyOutlined />,
      category: "目标信息",
    }
  );

  // 汇总信息
  options.push(
    {
      label: "总分数",
      value: "summary.totalScore",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    },
    {
      label: "总满分",
      value: "summary.maxTotalScore",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    },
    {
      label: "平均分",
      value: "summary.averageScore",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    },
    {
      label: "已完成目标数",
      value: "summary.completedGoals",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    },
    {
      label: "总目标数",
      value: "summary.totalGoals",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    },
    {
      label: "完成率",
      value: "summary.completionRate",
      icon: <BarChartOutlined />,
      category: "汇总信息",
    }
  );

  return options;
}
