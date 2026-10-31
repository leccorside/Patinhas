import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async getHealth() {
    const animalsCount = await this.prisma.animal.count();
    const usersCount = await this.prisma.user.count();

    return {
      status: 'ok',
      service: 'patinhas-api',
      database: 'connected',
      metrics: {
        animals: animalsCount,
        users: usersCount,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('animals/demo')
  async getDemoAnimals() {
    return this.prisma.animal.findMany({
      include: {
        photos: true,
        healthRecord: true,
        traits: true,
        organization: {
          select: { name: true, verifiedStatus: true },
        },
      },
      take: 5,
    });
  }

  @Get()
  getHello() {
    return {
      message: 'Bem-vindo à API Patinhas Adoção!',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}


