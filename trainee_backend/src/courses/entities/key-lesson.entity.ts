import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('key_lessons')
export class KeyLesson {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column({ nullable: true }) code!: string;
  @Column() title!: string;
  @Column({ nullable: true }) description!: string;
  @Column({ default: 0 }) position!: number;
  @ManyToOne(() => Course, (c) => c.keyLessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
