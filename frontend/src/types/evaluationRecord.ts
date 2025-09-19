export interface EvaluationRecordDTO {
  id: string;
  studentId: string;
  toolId: string;
  createdBy?: string | null;
  status: "pending" | "in_progress" | "completed";
  startedAt?: string | null;
  completedAt?: string | null;
  totalScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRecordItemDTO {
  id: string;
  evaluationId: string;
  longTermGoalId: string;
  answer?: any;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
}
