import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../../database/prisma.service';
import {
  SubscribePushDto,
  UpdateNotificationPreferencesDto,
} from './dto/notifications.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:suporte@patinhas.org';

    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn(
        'VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY não foram informadas no .env. Notificações Web Push não serão disparadas.',
      );
      return;
    }

    try {
      webpush.setVapidDetails(
        vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey,
      );
      this.logger.log('VAPID configurado com sucesso para Web Push a partir do .env.');
    } catch (err: any) {
      this.logger.error(`Falha ao configurar VAPID Web Push com as credenciais do .env: ${err.message}`);
    }
  }

  getVapidPublicKey() {
    return { publicKey: this.vapidPublicKey };
  }

  /**
   * Salvar ou atualizar assinatura de Web Push do dispositivo
   */
  async subscribe(userId: string, dto: SubscribePushDto) {
    const subscription = await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
      },
    });

    return {
      success: true,
      message: 'Inscrição de notificações push registrada com sucesso!',
      subscription,
    };
  }

  /**
   * Listar notificações do usuário
   */
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Marcar uma notificação específica como lida
   */
  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notif || notif.userId !== userId) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marcar todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Buscar preferências de notificação do usuário
   */
  async getUserPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  }

  /**
   * Atualizar preferências de notificação e horários de silêncio
   */
  async updateUserPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: {
        ...dto,
      },
    });
  }

  /**
   * Criar notificação no banco e despachar push via Web Push API
   */
  async notifyUser(
    userId: string,
    payload: {
      type: NotificationType;
      title: string;
      body: string;
      actionUrl?: string;
    },
  ) {
    // 1. Persistir no banco de dados
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
      },
    });

    // 2. Verificar preferências de silêncio e canais
    const prefs = await this.getUserPreferences(userId);
    if (this.isInQuietHours(prefs)) {
      this.logger.log(`Usuário ${userId} está em horário de silêncio. Push postergado.`);
      return notification;
    }

    // 3. Buscar inscrições de push ativas do usuário
    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    const pushData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: payload.actionUrl || '/',
        notificationId: notification.id,
      },
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushData,
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Inscrição expirada ou cancelada pelo browser, remover do banco
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          this.logger.warn(`Falha ao despachar push para ${sub.id}: ${err.message}`);
        }
      }
    }

    return notification;
  }

  private isInQuietHours(prefs: any): boolean {
    if (!prefs.quietHoursEnabled || !prefs.quietHoursStart || !prefs.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Cruzando meia-noite (ex: 22:00 até 08:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }
}

