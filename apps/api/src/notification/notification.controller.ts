import { Controller, Get, Patch, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats() {
    return this.notificationService.getStats();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationService.getNotifications(req.user.id, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sidebar')
  async getSidebarCounts(@Request() req: any) {
    return this.notificationService.getSidebarCounts(req.user.id, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id, req.user.role);
  }
}
