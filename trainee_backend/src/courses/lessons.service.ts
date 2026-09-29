import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonDocument } from './entities/lesson-document.entity';

export interface UpdateProgressDto {
  progressPercentage: number;
  lastPositionSeconds?: number;
}

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonDocument)
    private docRepo: Repository<LessonDocument>,
  ) {}

  /**
   * Update or create lesson progress for a user
   * Upserts on (userId, lessonId) composite primary key
   */
  async updateProgress(
    userId: string,
    lessonId: number,
    progressPercentage: number,
    lastPositionSeconds?: number,
  ): Promise<{ progressPercentage: number; lastPositionSeconds?: number; completedAt: Date | null }> {
    // Validate lesson exists
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Clamp progress to 0-100
    const progress = Math.min(100, Math.max(0, progressPercentage));
    const now = new Date();
    const isCompleted = progress >= 100;
    const posSeconds = lastPositionSeconds !== undefined ? Math.max(0, lastPositionSeconds) : 0;

    // Upsert on composite PK (userId, lessonId)
    await this.progressRepo.upsert(
      {
        userId,
        lessonId,
        progressPercentage: progress,
        lastPositionSeconds: posSeconds,
        lastWatchedAt: now,
        completedAt: isCompleted ? now : undefined,
      },
      ['userId', 'lessonId'],
    );

    return {
      progressPercentage: progress,
      lastPositionSeconds: posSeconds,
      completedAt: isCompleted ? now : null,
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

  private extractMuxId(playbackId?: string, videoUrl?: string): string {
    if (playbackId?.trim()) return playbackId.trim();
    if (!videoUrl) return '';
    const trimmed = videoUrl.trim();
    const streamMatch = trimmed.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)/);
    if (streamMatch) return streamMatch[1];
    const imageMatch = trimmed.match(/image\.mux\.com\/([a-zA-Z0-9_-]+)/);
    if (imageMatch) return imageMatch[1];
    if (/^[a-zA-Z0-9_-]{15,50}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }
    return '';
  }

  async createLesson(chapterId: number, data: {
    title: string;
    description?: string;
    duration?: string;
    type?: string;
    videoUrl?: string;
    playbackId?: string;
  }) {
    const count = await this.lessonRepo.count({
      where: { chapter: { id: chapterId } },
    });

    const muxPlaybackId = this.extractMuxId(data.playbackId, data.videoUrl);

    const lesson = this.lessonRepo.create({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      duration: data.duration || '',
      type: (data.type ? data.type.toUpperCase() : 'VIDEO'),
      video_url: data.videoUrl || '',
      mux_playback_id: muxPlaybackId,
      position: count + 1,
      chapter: { id: chapterId },
    });

    return this.lessonRepo.save(lesson);
  }

  async deleteLesson(lessonId: number) {
    await this.progressRepo.delete({ lessonId });
    await this.lessonRepo.delete(lessonId);
    return { message: 'Lesson deleted successfully' };
  }

  async updateLesson(lessonId: number, data: {
    title?: string;
    description?: string;
    duration?: string;
    videoUrl?: string;
    playbackId?: string;
  }) {
    let resolvedPlaybackId = data.playbackId;
    if (resolvedPlaybackId === undefined && data.videoUrl !== undefined) {
      resolvedPlaybackId = this.extractMuxId(undefined, data.videoUrl);
    }

    await this.lessonRepo.update(lessonId, {
      ...(data.title && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.videoUrl !== undefined && { video_url: data.videoUrl }),
      ...(resolvedPlaybackId !== undefined && { mux_playback_id: resolvedPlaybackId }),
    });
    return this.lessonRepo.findOne({ where: { id: lessonId } });
  }

  async addDocument(
    lessonId: number,
    data: {
      title: string;
      fileUrl: string;
      fileType?: string;
      fileSize?: string;
    },
  ) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const doc = this.docRepo.create({
      lessonId,
      title: data.title.trim(),
      fileUrl: data.fileUrl.trim(),
      fileType: data.fileType?.trim() || undefined,
      fileSize: data.fileSize?.trim() || undefined,
    });

    return this.docRepo.save(doc);
  }

  async deleteDocument(documentId: number) {
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    await this.docRepo.delete(documentId);
    return { message: 'Document deleted successfully', id: documentId };
  }

  async getDocuments(lessonId: number) {
    return this.docRepo.find({
      where: { lessonId },
      order: { createdAt: 'ASC' },
    });
  }
}
