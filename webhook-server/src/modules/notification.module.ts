import { Module } from '@nestjs/common';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';
import { NotificationRecipientsService } from '../services/notification-recipients/notification-recipients.service';
import { EntityModule } from './entity.module';
import { RepositoryModule } from './repository.module';
import { TelegramModule } from './telegram.module';

@Module({
  imports: [EntityModule, RepositoryModule, TelegramModule],
  providers: [NotificationMediatorService, NotificationRecipientsService],
  exports: [NotificationRecipientsService, NotificationRecipientsService],
})
export class NotificationModule {}
