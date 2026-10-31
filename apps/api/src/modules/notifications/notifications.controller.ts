import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  SubscribePushDto,
  UpdateNotificationPreferencesDto,
} from './dto/notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType } from '@prisma/client';

@ApiTags('Notificações e Push')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('push/public-key')
  @ApiOperation({ summary: 'Obter a chave pública VAPID para registro do Web Push no browser' })
  getVapidPublicKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @Post('push/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar assinatura de Web Push do dispositivo' })
  subscribe(@Req() req: any, @Body() dto: SubscribePushDto) {
    return this.notificationsService.subscribe(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  getUserNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar todas as notificações do usuário como lidas' })
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter preferências de canais e horários de silêncio' })
  getUserPreferences(@Req() req: any) {
    return this.notificationsService.getUserPreferences(req.user.id);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar preferências de notificações' })
  updateUserPreferences(
    @Req() req: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updateUserPreferences(req.user.id, dto);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disparar notificação de teste para o usuário' })
  sendTestNotification(@Req() req: any) {
    return this.notificationsService.notifyUser(req.user.id, {
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: 'Patinhas Conectado! 🐾',
      body: 'Suas notificações em tempo real e Web Push estão ativas e funcionando.',
      actionUrl: '/notifications',
    });
  }
}
