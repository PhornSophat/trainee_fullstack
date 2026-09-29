import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'lesson_id', type: 'int' })
  lessonId!: number;

  @Column({ name: 'progress_percentage', type: 'int', default: 0 })
  progressPercentage!: number;

  @Column({ name: 'last_watched_at', type: 'timestamptz', nullable: true })
  lastWatchedAt?: Date;

  @Column({ name: 'last_position_seconds', type: 'real', default: 0 })
  lastPositionSeconds!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
