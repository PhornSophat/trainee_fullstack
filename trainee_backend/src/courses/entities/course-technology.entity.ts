import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('course_technologies')
export class CourseTechnology {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() name!: string;
  @Column({ nullable: true }) icon?: string;
  @ManyToOne(() => Course, (c) => c.technologies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
