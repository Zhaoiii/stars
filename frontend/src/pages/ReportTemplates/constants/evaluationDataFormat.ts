// 评估数据格式示例，供右侧面板预览与字段参考使用
export const evaluationDataFormat = {
  student: {
    id: "学生ID",
    name: "学生姓名",
    team: {
      id: "团队ID",
      name: "团队名称",
    },
  },
  evaluation: {
    id: "评估记录ID",
    toolId: "评估工具ID",
    toolTitle: "评估工具名称",
    status: "评估状态",
    createdAt: "创建时间",
    completedAt: "完成时间",
  },
  goals: {
    目标1: {
      id: "目标ID",
      title: "目标标题",
      score: 85,
      maxScore: 100,
      answers: [
        { type: "quantity", value: 5 },
        { type: "multiple_choice", selected: ["选项A", "选项B"] },
      ],
    },
    目标2: {
      id: "目标ID",
      title: "目标标题",
      score: 92,
      maxScore: 100,
      answers: [{ type: "single_choice", selected: "选项C" }],
    },
  },
  summary: {
    totalScore: 177,
    maxTotalScore: 200,
    averageScore: 88.5,
    completedGoals: 2,
    totalGoals: 2,
    completionRate: 100,
  },
} as const;
