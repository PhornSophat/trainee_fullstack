import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chapter } from './chapter.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() title!: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: 'varchar', default: 'VIDEO' }) type!: string;
  @Column({ nullable: true }) duration?: string;
  @Column({ nullable: true }) video_url?: string;
  @Column({ nullable: true }) mux_playback_id?: string;
  @Column({ default: 0 }) position!: number;

  @ManyToOne(() => Chapter, (chapter: Chapter) => chapter.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_id' })
  chapter!: Chapter;
}
