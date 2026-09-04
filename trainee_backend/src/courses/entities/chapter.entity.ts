import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() title!: string;
  @Column({ default: 0 }) position!: number;

  @ManyToOne(() => Course, (course: Course) => course.chapters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.chapter)
  lessons!: Lesson[];
}
