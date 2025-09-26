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
} from "typeorm";
import { UserRole, UserStatus } from "../types/enums";
import { Team } from "./Team";
import { Student } from "./Student";
import { Course } from "./Course";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.TEACHER,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  teamId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 用户与团队的关系：多个用户属于一个团队
  @ManyToOne(() => Team, (team) => team.users, { nullable: true })
  @JoinColumn({ name: "teamId" })
  team: Team;

  // 用户与学生的关系：多个教师可以教授多个学生
  @ManyToMany(() => Student, (student) => student.teachers)
  students: Student[];

  // 用户与课程的关系：一个教师可以有多个课程
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];
}
