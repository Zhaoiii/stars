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
import { Student } from "./Student";
import { User } from "./User";
import { CourseType, CourseStatus, RepeatMode } from "../types/enums";

@Entity("courses")
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: CourseType,
  })
  type: CourseType;

  @Column({
    type: "enum",
    enum: CourseStatus,
    default: CourseStatus.SCHEDULED,
  })
  status: CourseStatus;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: "enum",
    enum: RepeatMode,
    default: RepeatMode.NONE,
  })
  repeatMode: RepeatMode;

  @Column({ nullable: true })
  repeatEndDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column()
  studentId: number;

  @Column()
  teacherId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 课程与学生的关系：多个课程属于一个学生
  @ManyToOne(() => Student, (student) => student.courses, { nullable: false })
  @JoinColumn({ name: "studentId" })
  student: Student;

  // 课程与教师的关系：多个课程属于一个教师
  @ManyToOne(() => User, (user) => user.courses, { nullable: false })
  @JoinColumn({ name: "teacherId" })
  teacher: User;
}
