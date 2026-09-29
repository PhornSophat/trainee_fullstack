import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { HomeworkTask } from './homework-task.entity';

@Entity('homeworks')
export class Homework {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ name: 'title_en', nullable: true, type: 'text' })
  titleEn?: string;

  @Column({ name: 'description_en', nullable: true, type: 'text' })
  descriptionEn?: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => HomeworkTask, (task) => task.homework, { cascade: true })
  tasks!: HomeworkTask[];
}
