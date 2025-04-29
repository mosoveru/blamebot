import { Logger, Module } from '@nestjs/common';
import { NotificationService } from '../services/notification/notification.service';
import { NotificationRecipientsService } from '../services/notification-recipients/notification-recipients.service';
import { EntityModule } from './entity.module';
import { RepositoryModule } from './repository.module';
import { TelegramModule } from './telegram.module';
import { NotificationComposerService } from '../services/notification-composer/notification-composer.service';
import { MessageComposerConstructors } from '../services/notification-composer/message-composers';
import { ChangesAnalyserService } from '../services/changes-analyser/changes-analyser.service';
import { MessageAssignmentService } from '../services/message-assignment/message-assignment.service';
import { WebhookController } from '../controllers/webhook.controller';

@Module({
  imports: [EntityModule, RepositoryModule, TelegramModule],
  providers: [
    NotificationService,
    NotificationRecipientsService,
    {
      provide: NotificationComposerService,
      useFactory: () => {
        const composersMap = new Map();
        for (const ComposerConstructor of MessageComposerConstructors) {
          const createdComposer = new ComposerConstructor();
          composersMap.set(createdComposer.meantFor, createdComposer);
        }
        return new NotificationComposerService(new Logger(), composersMap);
      },
    },
    ChangesAnalyserService,
    MessageAssignmentService,
  ],
  controllers: [WebhookController],
  exports: [NotificationService],
})
export class NotificationModule {}
