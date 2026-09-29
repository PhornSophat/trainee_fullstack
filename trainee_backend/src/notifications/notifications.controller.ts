import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  async findAll(@Query('role') role?: string) {
    return this.notifService.findAll(role);
  }

  @Patch('read-all')
  async markAllAsRead(@Query('role') role?: string) {
    return this.notifService.markAllAsRead(role);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notifService.markAsRead(id);
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return this.notifService.create(dto);
  }
}
