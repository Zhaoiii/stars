import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { EvaluationToolNode } from "./EvaluationToolNode";

@Entity("report_templates")
@Unique(["toolId"]) // 每个评估工具只能绑定一个模板
export class ReportTemplate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  toolId: string;

  @ManyToOne(() => EvaluationToolNode, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tool_id" })
  tool: EvaluationToolNode;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "jsonb" })
  content: any; // 存储 tiptap 的 JSON 格式内容

  @Column({ type: "varchar", default: "draft" })
  status: "draft" | "published"; // 草稿或已发布

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
