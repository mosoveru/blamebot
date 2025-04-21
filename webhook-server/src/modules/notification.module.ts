import { Module } from '@nestjs/common';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';
import { NotificationRecipientsService } from '../services/notification-recipients/notification-recipients.service';
import { RepositoryModule } from './repository.module';
import { HandlersModule } from './handlers.module';
import { TelegramModule } from './telegram.module';

@Module({
  imports: [RepositoryModule, HandlersModule, TelegramModule],
  providers: [NotificationMediatorService, NotificationRecipientsService],
  exports: [NotificationRecipientsService, NotificationRecipientsService],
})
export class NotificationModule {}
