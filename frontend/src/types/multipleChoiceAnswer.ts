export interface MultipleChoiceAnswerDTO {
  id: string;
  label: string;
  toolId: string;
  longTermGoalId: string;
  createdBy: string | null;
  tool?: {
    id: string;
    title: string;
  };
  longTermGoal?: {
    id: string;
    title: string;
    targetAge?: number | null;
  };
  creator?: {
    id: string;
    username: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMultipleChoiceAnswerPayload {
  label: string;
  toolId: string;
  longTermGoalId: string;
  createdBy?: string | null;
}

export type UpdateMultipleChoiceAnswerPayload =
  Partial<CreateMultipleChoiceAnswerPayload>;

export interface QueryMultipleChoiceAnswerParams {
  toolId?: string;
  longTermGoalId?: string;
  createdBy?: string;
}
