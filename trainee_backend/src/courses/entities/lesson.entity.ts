import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Chapter } from './chapter.entity';
import { LessonDocument } from './lesson-document.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() title!: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: 'varchar', default: 'VIDEO' }) type!: string;
  @Column({ nullable: true }) duration?: string;
  @Column({ nullable: true }) video_url?: string;
  @Column({ nullable: true }) mux_playback_id?: string;
  @Column({ nullable: true }) mux_asset_id?: string;
  @Column({ default: 0 }) position!: number;

  @ManyToOne(() => Chapter, (chapter: Chapter) => chapter.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_id' })
  chapter!: Chapter;

  @OneToMany(() => LessonDocument, (doc) => doc.lesson)
  documents!: LessonDocument[];
}
