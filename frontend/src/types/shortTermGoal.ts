export interface ShortTermGoalDTO {
  id: string;
  longTermGoalId: string;
  toolId: string;
  title: string;
  description?: string | null;
  order: number;
  longTermGoal?: {
    id: string;
    title: string;
    targetAge?: number | null;
  };
  tool?: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateShortTermGoalPayload {
  longTermGoalId: string;
  toolId: string;
  title: string;
  description?: string | null;
  order?: number;
}

export type UpdateShortTermGoalPayload = Partial<CreateShortTermGoalPayload>;
