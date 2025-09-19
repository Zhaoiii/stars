export enum EvaluationNodeType {
  ROOT = "root",
  CATEGORY = "category",
  LONG_TERM_GOAL = "long_term_goal",
  SHORT_TERM_GOAL = "short_term_goal",
}

export enum EvaluationScoringType {
  NONE = "none",
  QUANTITY = "quantity",
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
}

export type QuantityRule = { quantity: number; score: number };
export type SingleChoiceRule = { label: string; score: number };

export interface EvaluationScoringOption {
  id: string;
  nodeId: string;
  label: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationToolNodeDTO {
  id: string;
  parentId: string | null;
  nodeType: EvaluationNodeType;
  title: string;
  description?: string | null;
  targetAge?: number | null;
  order: number;
  scoringType: EvaluationScoringType;
  scoringConfig: QuantityRule[] | SingleChoiceRule[] | null;
  options?: EvaluationScoringOption[];
  children?: EvaluationToolNodeDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateToolPayload {
  title: string;
  description?: string | null;
  order?: number;
}

export interface CreateNodePayload {
  parentId: string | null;
  nodeType: EvaluationNodeType;
  title: string;
  description?: string | null;
  targetAge?: number | null;
  order?: number;
  scoringType: EvaluationScoringType;
  scoringConfig?: QuantityRule[] | SingleChoiceRule[] | null;
}

export type UpdateNodePayload = Partial<CreateNodePayload>;

export interface CreateOptionPayload {
  label: string;
  score: number;
}

export type UpdateOptionPayload = Partial<CreateOptionPayload>;
