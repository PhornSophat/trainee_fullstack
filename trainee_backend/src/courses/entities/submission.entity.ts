import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { HomeworkTask } from './homework-task.entity';
import { SubmissionAttachment } from './submission-attachment.entity';
import { ChatMessage } from './chat-message.entity';

export enum HomeworkStatusEnum {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  DOING = 'DOING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => HomeworkTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: HomeworkTask;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId?: string;

  @Column({
    type: 'enum',
    enum: HomeworkStatusEnum,
    default: HomeworkStatusEnum.NOT_SUBMITTED,
  })
  status!: HomeworkStatusEnum;

  @Column({ type: 'int', nullable: true })
  score?: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @OneToMany(() => SubmissionAttachment, (att) => att.submission, {
    cascade: true,
  })
  attachments!: SubmissionAttachment[];

  @OneToMany(() => ChatMessage, (msg) => msg.submission, {
    cascade: true,
  })
  messages!: ChatMessage[];
}
