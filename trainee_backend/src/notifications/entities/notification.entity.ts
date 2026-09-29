import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'COURSE_REQUEST' })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  breadcrumb?: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sender_name?: string;

  @Column({ type: 'text', nullable: true })
  avatar_url?: string;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  target_url?: string;

  @Column({ type: 'int', nullable: true })
  course_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  course_title?: string;

  @Column({ type: 'varchar', length: 20, default: 'all' })
  for_role!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
