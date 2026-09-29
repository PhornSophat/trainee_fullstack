import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async onModuleInit() {
    try {
      await this.notifRepo.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50) NOT NULL DEFAULT 'COURSE_REQUEST',
          title VARCHAR(255) NOT NULL,
          breadcrumb VARCHAR(255),
          message TEXT NOT NULL,
          sender_name VARCHAR(100),
          avatar_url TEXT,
          read BOOLEAN NOT NULL DEFAULT false,
          target_url VARCHAR(255),
          course_id INT,
          course_title VARCHAR(255),
          for_role VARCHAR(20) NOT NULL DEFAULT 'all',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Seed historical mock notifications if empty
      const count = await this.notifRepo.count();
      if (count === 0) {
        const seedItems: Partial<Notification>[] = [
          {
            type: 'COURSE_REQUEST',
            breadcrumb: 'អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ឡេង សុខជាយ បានពិនិត្យសំណើរបស់អ្នក ...',
            sender_name: 'ឡេង សុខជាយ',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 7 * 86400000),
          },
          {
            type: 'COURSE_REJECTED',
            breadcrumb: 'រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ខូច គឿន បានបដិសេធសំណើក្នុងការចូលរួម...',
            sender_name: 'ខូច គឿន',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 7 * 86400000 - 3600000),
          },
          {
            type: 'COURSE_APPROVED',
            breadcrumb: 'ដំណើរការប្រព័ន្ធឌីជីថល > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ខូច គឿន បានអនុម័តសំណើក្នុងការចូលរួម ...',
            sender_name: 'ខូច គឿន',
            avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 7 * 86400000 - 7200000),
          },
          {
            type: 'COURSE_REQUEST',
            breadcrumb: 'អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ឡេង សុខជាយ បានពិនិត្យសំណើចូលរួម អ...',
            sender_name: 'ឡេង សុខជាយ',
            avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 8 * 86400000),
          },
          {
            type: 'COURSE_REQUEST',
            breadcrumb: 'រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ឡេង សុខជាយ បានពិនិត្យសំណើចូលរួម រ...',
            sender_name: 'ឡេង សុខជាយ',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 8 * 86400000 - 1800000),
          },
          {
            type: 'COURSE_REQUEST',
            breadcrumb: 'អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ជីង គឹមឡាយ បានពិនិត្យសំណើចូលរួម អភិ...',
            sender_name: 'ជីង គឹមឡាយ',
            avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 9 * 86400000),
          },
          {
            type: 'COURSE_REQUEST',
            breadcrumb: 'រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            message: 'ជីង គឹមឡាយ បានពិនិត្យសំណើចូលរួម រច...',
            sender_name: 'ជីង គឹមឡាយ',
            avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
            read: true,
            for_role: 'all',
            target_url: '/trainee/programs',
            created_at: new Date(Date.now() - 9 * 86400000 - 3600000),
          },
        ];

        for (const item of seedItems) {
          await this.notifRepo.save(this.notifRepo.create(item));
        }
        this.logger.log('Seeded initial mock notifications into PostgreSQL database.');
      }

      // Automatically sync any courses currently awaiting approval (e.g. React Developer)
      await this.syncPendingCourses();
    } catch (err) {
      this.logger.error('Failed to initialize notifications table:', err);
    }
  }

  async syncPendingCourses(): Promise<void> {
    try {
      const pendingCourses: Array<{ id: number; title: string; khmer_title?: string }> =
        await this.notifRepo.query(`
          SELECT id, title, khmer_title 
          FROM courses 
          WHERE approved_status = 'PENDING'
        `);

      for (const pc of pendingCourses) {
        const existing = await this.notifRepo.findOne({
          where: {
            course_id: pc.id,
            type: 'COURSE_REQUEST',
            for_role: 'admin',
          },
        });

        if (!existing) {
          const newNotif = this.notifRepo.create({
            type: 'COURSE_REQUEST',
            title: 'សំណើចូលរៀនជំនាញសិក្សា',
            breadcrumb: `${pc.khmer_title || pc.title} > សំណើ`,
            message: `សុផាត ផន បានស្នើសុំចូលរៀនវគ្គ ${pc.title}`,
            sender_name: 'សុផាត ផន',
            avatar_url: '/e20220628.jpg',
            course_id: pc.id,
            course_title: pc.title,
            target_url: '/admin/approvals',
            for_role: 'admin',
            read: false,
          });
          await this.notifRepo.save(newNotif);
          this.logger.log(
            `Synchronized pending request notification for course "${pc.title}" (ID: ${pc.id})`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Failed to sync pending courses into notifications:', err);
    }
  }

  async findAll(role?: string): Promise<Notification[]> {
    if (role === 'admin' || !role) {
      await this.syncPendingCourses();
    }

    const qb = this.notifRepo
      .createQueryBuilder('n')
      .orderBy('n.created_at', 'DESC');

    if (role && role !== 'all') {
      qb.where('n.for_role = :role OR n.for_role = :all', {
        role,
        all: 'all',
      });
    }

    return qb.getMany();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    await this.notifRepo.update(id, { read: true });
    return this.notifRepo.findOne({ where: { id } });
  }

  async markAllAsRead(role?: string): Promise<{ success: boolean }> {
    const qb = this.notifRepo.createQueryBuilder().update(Notification).set({ read: true });

    if (role && role !== 'all') {
      qb.where('for_role = :role OR for_role = :all', {
        role,
        all: 'all',
      });
    }

    await qb.execute();
    return { success: true };
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({
      title: dto.title,
      message: dto.message,
      type: dto.type ?? 'COURSE_REQUEST',
      breadcrumb: dto.breadcrumb,
      sender_name: dto.sender_name ?? 'សុផាត ផន',
      avatar_url: dto.avatar_url ?? '/e20220628.jpg',
      read: dto.read ?? false,
      target_url: dto.target_url,
      course_id: dto.course_id,
      course_title: dto.course_title,
      for_role: dto.for_role ?? 'all',
    });

    return this.notifRepo.save(notif);
  }
}
