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

@Entity("short_term_goals")
export class ShortTermGoal extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  longTermGoalId: string;

  @Column({ type: "bigint" })
  toolId: string;

  @ManyToOne(() => EvaluationToolNode, (node) => node.shortTermGoals, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "long_term_goal_id" })
  longTermGoal: EvaluationToolNode;

  @ManyToOne(() => EvaluationToolNode, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "tool_id" })
  tool: EvaluationToolNode;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", default: 0 })
  order: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
