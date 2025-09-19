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
import { Student } from "./Student";
import { EvaluationToolNode } from "./EvaluationToolNode";
import { User } from "./User";
import { EvaluationRecordItem } from "./EvaluationRecordItem";

export enum EvaluationRecordStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

@Entity("evaluation_records")
export class EvaluationRecord extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  studentId: string;

  @Column({ type: "bigint" })
  toolId: string; // 评估工具 root 节点 ID

  @Column({ type: "bigint", nullable: true })
  createdBy: string | null;

  @Column({ type: "varchar", default: EvaluationRecordStatus.PENDING })
  status: EvaluationRecordStatus;

  @Column({ type: "timestamptz", nullable: true })
  startedAt: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  completedAt: Date | null;

  @Column({ type: "float", nullable: true })
  totalScore: number | null;

  @ManyToOne(() => Student, { onDelete: "CASCADE" })
  @JoinColumn({ name: "student_id" })
  student: Student;

  @ManyToOne(() => EvaluationToolNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tool_id" })
  tool: EvaluationToolNode;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  creator: User;

  @OneToMany(() => EvaluationRecordItem, (item) => item.evaluation, {
    cascade: true,
  })
  items: EvaluationRecordItem[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
