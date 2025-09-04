export type Score = "已掌握" | "部分掌握" | "未掌握";

export type Milestone = {
  id: string;
  title: string;
  score?: Score;
  note?: string;
};
