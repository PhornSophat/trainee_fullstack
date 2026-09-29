import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Mux from '@mux/mux-node';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private muxClient: Mux | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {
    const tokenId = this.configService.get<string>('MUX_TOKEN_ID') || process.env.MUX_TOKEN_ID;
    const tokenSecret = this.configService.get<string>('MUX_TOKEN_SECRET') || process.env.MUX_TOKEN_SECRET;

    if (tokenId && tokenSecret) {
      this.muxClient = new Mux({
        tokenId,
        tokenSecret,
      });
      this.logger.log('Mux client initialized successfully');
    } else {
      this.logger.warn('MUX_TOKEN_ID or MUX_TOKEN_SECRET not set. Mux direct upload will be in standby/mock mode.');
    }
  }

  isConfigured(): boolean {
    return this.muxClient !== null;
  }

  /**
   * Format seconds to MM:SS or HH:MM:SS
   */
  formatDuration(seconds?: number): string {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
    const totalSecs = Math.round(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  /**
   * Create a direct upload URL for client-side direct upload
   */
  async createDirectUpload(lessonId?: number) {
    if (!this.muxClient) {
      return {
        configured: false,
        message: 'Mux is not configured with MUX_TOKEN_ID and MUX_TOKEN_SECRET',
      };
    }

    try {
      const upload = await this.muxClient.video.uploads.create({
        new_asset_settings: {
          playback_policy: ['public'],
          passthrough: lessonId ? String(lessonId) : undefined,
        },
        cors_origin: '*',
      });

      return {
        configured: true,
        uploadId: upload.id,
        uploadUrl: upload.url,
        status: upload.status,
      };
    } catch (err: any) {
      this.logger.error('Failed to create direct upload on Mux', err);
      throw new BadRequestException(err?.message || 'Failed to create Mux direct upload');
    }
  }

  /**
   * Check status of a direct upload and its created asset
   */
  async getUploadStatus(uploadId: string) {
    if (!this.muxClient) {
      return { configured: false };
    }

    try {
      const upload = await this.muxClient.video.uploads.retrieve(uploadId);
      let assetDetails: {
        assetId?: string;
        playbackId?: string;
        duration?: string;
        durationSeconds?: number;
        status?: string;
      } = {
        assetId: upload.asset_id,
        status: upload.status,
      };

      if (upload.asset_id) {
        try {
          const asset = await this.muxClient.video.assets.retrieve(upload.asset_id);
          const playbackId = asset.playback_ids?.[0]?.id;
          const durationFormatted = this.formatDuration(asset.duration);

          assetDetails = {
            assetId: asset.id,
            playbackId,
            duration: durationFormatted,
            durationSeconds: asset.duration,
            status: asset.status,
          };

          // If passthrough is a lessonId, auto-update the lesson
          if (asset.passthrough && !isNaN(Number(asset.passthrough))) {
            const lessonId = Number(asset.passthrough);
            await this.lessonRepo.update(lessonId, {
              ...(playbackId && { mux_playback_id: playbackId }),
              ...(asset.id && { mux_asset_id: asset.id }),
              ...(durationFormatted && { duration: durationFormatted }),
              ...(playbackId && { video_url: `https://stream.mux.com/${playbackId}.m3u8` }),
            });
          }
        } catch (assetErr) {
          this.logger.warn(`Could not fetch asset details for ${upload.asset_id}:`, assetErr);
        }
      }

      return {
        configured: true,
        uploadId: upload.id,
        uploadStatus: upload.status,
        ...assetDetails,
      };
    } catch (err: any) {
      this.logger.error(`Failed to retrieve upload ${uploadId}`, err);
      throw new BadRequestException(err?.message || 'Failed to retrieve Mux upload');
    }
  }

  /**
   * Process Mux webhook event (e.g. video.asset.ready)
   */
  async handleWebhook(event: any) {
    this.logger.log(`Received Mux Webhook: ${event?.type}`);

    if (event?.type === 'video.asset.ready' && event?.data) {
      const asset = event.data;
      const playbackId = asset.playback_ids?.[0]?.id;
      const durationFormatted = this.formatDuration(asset.duration);
      const lessonId = asset.passthrough ? Number(asset.passthrough) : null;

      this.logger.log(
        `Asset Ready: id=${asset.id}, playbackId=${playbackId}, duration=${durationFormatted}, lessonId=${lessonId}`,
      );

      if (lessonId && !isNaN(lessonId)) {
        await this.lessonRepo.update(lessonId, {
          ...(playbackId && { mux_playback_id: playbackId }),
          ...(asset.id && { mux_asset_id: asset.id }),
          ...(durationFormatted && { duration: durationFormatted }),
          ...(playbackId && { video_url: `https://stream.mux.com/${playbackId}.m3u8` }),
        });
      } else if (asset.id) {
        // Try to find lesson by mux_asset_id
        const existing = await this.lessonRepo.findOne({ where: { mux_asset_id: asset.id } });
        if (existing) {
          await this.lessonRepo.update(existing.id, {
            ...(playbackId && { mux_playback_id: playbackId }),
            ...(durationFormatted && { duration: durationFormatted }),
            ...(playbackId && { video_url: `https://stream.mux.com/${playbackId}.m3u8` }),
          });
        }
      }
    }

    return { received: true };
  }
}
