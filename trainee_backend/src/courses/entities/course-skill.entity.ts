import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('course_skills')
export class CourseSkill {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() text!: string;
  @Column({ default: 0 }) position!: number;
  @ManyToOne(() => Course, (c) => c.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
