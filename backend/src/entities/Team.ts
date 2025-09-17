import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Student } from "./Student";

@Entity("teams")
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 团队与用户的关系：一个团队可以有多个用户
  @OneToMany(() => User, (user) => user.team)
  users: User[];

  // 团队与学生的关系：一个团队可以有多个学生
  @OneToMany(() => Student, (student) => student.team)
  students: Student[];
}
