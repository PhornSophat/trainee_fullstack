import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('course_faqs')
export class CourseFaq {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() question!: string;
  @Column({ nullable: true }) answer!: string;
  @Column({ default: 0 }) position!: number;
  @ManyToOne(() => Course, (c) => c.faqs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
