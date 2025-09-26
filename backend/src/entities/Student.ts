import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { Team } from "./Team";
import { User } from "./User";
import { Course } from "./Course";
import { Gender } from "../types/enums";

@Entity("students")
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "date" })
  birthDate: string;

  @Column({
    type: "enum",
    enum: Gender,
  })
  gender: Gender;

  @Column({ nullable: true })
  remarks: string;

  @Column()
  teamId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 学生与团队的关系：多个学生属于一个团队
  @ManyToOne(() => Team, (team) => team.students, { nullable: false })
  @JoinColumn({ name: "teamId" })
  team: Team;

  // 学生与教师的关系：多个学生可以有多个教师
  @ManyToMany(() => User, (user) => user.students)
  @JoinTable({
    name: "student_teachers",
    joinColumn: {
      name: "studentId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "teacherId",
      referencedColumnName: "id",
    },
  })
  teachers: User[];

  // 学生与课程的关系：一个学生可以有多个课程
  @OneToMany(() => Course, (course) => course.student)
  courses: Course[];
}
