import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Chapter } from './chapter.entity';
import { User } from './user.entity';
import { CourseSkill } from './course-skill.entity';
import { CourseTechnology } from './course-technology.entity';
import { KeyLesson } from './key-lesson.entity';
import { CourseFaq } from './course-faqs.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('increment') id!: number;
  @Column() title!: string;
  @Column({ nullable: true }) khmer_title?: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) image_url?: string;
  @Column({ type: 'varchar', default: 'BASIC' }) level!: string;
  @Column({ nullable: true }) duration?: string;
  @Column({
    name: 'approved_status',
    type: 'varchar',
    default: 'NOT_REQUESTED',
  })
  approval_status!: string;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;

  @OneToMany(() => Chapter, (chapter: Chapter) => chapter.course, {
    cascade: true,
  })
  chapters!: Chapter[];

  @ManyToMany(() => User, { eager: false })
  @JoinTable({
    name: 'course_instructors',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  instructors!: User[];

  @OneToMany(() => CourseSkill, (skill: CourseSkill) => skill.course, {
    cascade: true,
  })
  skills!: CourseSkill[];

  @OneToMany(
    () => CourseTechnology,
    (technology: CourseTechnology) => technology.course,
    { cascade: true },
  )
  technologies!: CourseTechnology[];

  @OneToMany(() => KeyLesson, (keyLesson: KeyLesson) => keyLesson.course, {
    cascade: true,
  })
  keyLessons!: KeyLesson[];

  @OneToMany(() => CourseFaq, (faq: CourseFaq) => faq.course, {
    cascade: true,
  })
  faqs!: CourseFaq[];
}
