import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { GeoModule } from './modules/geo/geo.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    StorageModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AnimalsModule,
    GeoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
