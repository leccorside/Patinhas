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
import { FavoritesModule } from './modules/favorites/favorites.module';
import { AdoptionsModule } from './modules/adoptions/adoptions.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AdminModule } from './modules/admin/admin.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { LostFoundModule } from './modules/lost-found/lost-found.module';
import { FosterModule } from './modules/foster/foster.module';
import { EventsModule } from './modules/events/events.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';

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
    FavoritesModule,
    AdoptionsModule,
    ChatModule,
    NotificationsModule,
    MatchingModule,
    AdminModule,
    ModerationModule,
    LostFoundModule,
    FosterModule,
    EventsModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
