import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'patinhas-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
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

