import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { EvaluationNodeType, EvaluationScoringType } from "../types/enums";
import { EvaluationScoringOption } from "./EvaluationScoringOption";
import { ShortTermGoal } from "./ShortTermGoal";

@Entity("evaluation_tool_nodes")
export class EvaluationToolNode extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint", nullable: true })
  parentId: string | null;

  @ManyToOne(() => EvaluationToolNode, (node) => node.children, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent: EvaluationToolNode | null;

  @OneToMany(() => EvaluationToolNode, (node) => node.parent)
  children: EvaluationToolNode[];

  @Column({
    type: "enum",
    enum: EvaluationNodeType,
  })
  nodeType: EvaluationNodeType;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", nullable: true })
  targetAge: number | null;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({
    type: "enum",
    enum: EvaluationScoringType,
    default: EvaluationScoringType.NONE,
  })
  scoringType: EvaluationScoringType;

  @Column({ type: "jsonb", nullable: true })
  scoringConfig: any | null;

  @OneToMany(() => EvaluationScoringOption, (opt) => opt.node, {
    cascade: true,
  })
  options: EvaluationScoringOption[];

  @OneToMany(() => ShortTermGoal, (goal) => goal.longTermGoal, {
    cascade: true,
  })
  shortTermGoals: ShortTermGoal[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
