import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('lesson_documents')
export class LessonDocument {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'lesson_id', type: 'bigint' })
  lessonId!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl!: string;

  @Column({ name: 'file_type', type: 'text', nullable: true })
  fileType?: string;

  @Column({ name: 'file_size', type: 'text', nullable: true })
  fileSize?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;
}
