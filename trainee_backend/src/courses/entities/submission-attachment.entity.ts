import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Entity('submission_attachments')
export class SubmissionAttachment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Submission, (sub) => sub.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;

  @Column({ name: 'file_name', type: 'text' })
  fileName!: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt!: Date;
}
