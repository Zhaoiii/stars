import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { EvaluationToolNode } from "./EvaluationToolNode";
import { User } from "./User";

@Entity("multiple_choice_answers")
export class MultipleChoiceAnswer extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "bigint" })
  toolId: string;

  @Column({ type: "bigint" })
  longTermGoalId: string;

  @Column({ type: "bigint", nullable: true })
  createdBy: string | null;

  @ManyToOne(() => EvaluationToolNode, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "tool_id" })
  tool: EvaluationToolNode;

  @ManyToOne(() => EvaluationToolNode, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "long_term_goal_id" })
  longTermGoal: EvaluationToolNode;

  @ManyToOne(() => User, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "created_by" })
  creator: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
