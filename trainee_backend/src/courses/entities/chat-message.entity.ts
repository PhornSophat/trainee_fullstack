import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

export enum ChatSenderEnum {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Submission, (sub) => sub.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;

  @Column({ name: 'sender_name', type: 'text' })
  senderName!: string;

  @Column({
    type: 'enum',
    enum: ChatSenderEnum,
    default: ChatSenderEnum.STUDENT,
  })
  sender!: ChatSenderEnum;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt!: Date;
}
