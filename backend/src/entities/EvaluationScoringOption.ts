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

@Entity("evaluation_scoring_options")
export class EvaluationScoringOption extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  nodeId: string;

  @ManyToOne(() => EvaluationToolNode, (node) => node.options, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "node_id" })
  node: EvaluationToolNode;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "int" })
  score: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
