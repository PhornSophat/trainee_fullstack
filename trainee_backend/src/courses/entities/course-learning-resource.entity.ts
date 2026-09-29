import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('course_learning_resources')
export class CourseLearningResource {
  @PrimaryGeneratedColumn('increment') id!: number;

  @Column() title!: string;

  @Column({ nullable: true }) url?: string;

  @Column({ default: 'file' }) icon!: string;

  @Column({ default: 0 }) position!: number;

  @ManyToOne(() => Course, (c) => c.learningResources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
