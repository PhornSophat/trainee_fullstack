import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Lesson } from './entities/lesson.entity';

export interface UpdateProgressDto {
  progressPercentage: number;
}

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
  ) {}

  /**
   * Update or create lesson progress for a user
   * Upserts on (userId, lessonId) composite primary key
   */
  async updateProgress(
    userId: string,
    lessonId: number,
    progressPercentage: number,
  ): Promise<{ progressPercentage: number; completedAt: Date | null }> {
    // Validate lesson exists
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Clamp progress to 0-100
    const progress = Math.min(100, Math.max(0, progressPercentage));
    const now = new Date();
    const isCompleted = progress >= 100;

    // Upsert on composite PK (userId, lessonId)
    await this.progressRepo.upsert(
      {
        userId,
        lessonId,
        progressPercentage: progress,
        lastWatchedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined,
      },
      ['userId', 'lessonId'],
    );

    return {
      progressPercentage: progress,
      completedAt: isCompleted ? new Date() : null,
    };
  }

  /**
   * Get user's progress for a specific lesson
   */
  async getProgress(userId: string, lessonId: number) {
    return this.progressRepo.findOne({
      where: { userId, lessonId },
    });
  }

  /**
   * Get all progress for a user across all lessons
   */
  async getUserProgress(userId: string) {
    return this.progressRepo.find({ where: { userId } });
  }
}
