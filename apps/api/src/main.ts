import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3333;
  const prefix = process.env.API_PREFIX || 'api/v1';

  app.setGlobalPrefix(prefix);
  app.use(cookieParser(process.env.COOKIE_SECRET || 'patinhas_cookie_secret'));
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuração do Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Patinhas API')
    .setDescription('API REST da plataforma de adoção de animais Patinhas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`API Patinhas iniciada em http://0.0.0.0:${port}/${prefix}`);
  logger.log(`Swagger OpenAPI disponível em http://localhost:${port}/api/docs`);
}

bootstrap();

