import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Homework } from './homework.entity';

@Entity('homework_tasks')
export class HomeworkTask {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ type: 'varchar', default: 'TASK' })
  type!: string;

  @Column({ name: 'max_score', default: 100 })
  maxScore!: number;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Column({ name: 'title_en', nullable: true, type: 'text' })
  titleEn?: string;

  @Column({ name: 'description_en', nullable: true, type: 'text' })
  descriptionEn?: string;

  @ManyToOne(() => Homework, (hw) => hw.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'homework_id' })
  homework!: Homework;
}
