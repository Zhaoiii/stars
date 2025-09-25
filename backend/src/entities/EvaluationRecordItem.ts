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
import { EvaluationRecord } from "./EvaluationRecord";
import { EvaluationToolNode } from "./EvaluationToolNode";

@Entity("evaluation_record_items")
export class EvaluationRecordItem extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  evaluationId: string;

  @Column({ type: "bigint" })
  longTermGoalId: string; // 长期目标节点 ID

  @Column({ type: "jsonb", nullable: true })
  answer: any | null; // 不同评分类型答案结构不同

  @Column({ type: "float", nullable: true })
  score: number | null; // 该长期目标得分

  @Column({ type: "text", nullable: true })
  remark: string | null; // 备注

  @ManyToOne(() => EvaluationRecord, (e) => e.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "evaluation_id" })
  evaluation: EvaluationRecord;

  @ManyToOne(() => EvaluationToolNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "long_term_goal_id" })
  longTermGoal: EvaluationToolNode;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
