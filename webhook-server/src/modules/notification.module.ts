import { Logger, Module } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationRecipientsService } from '../services/notification-recipients.service';
import { EntityModule } from './entity.module';
import { RepositoryModule } from './repository.module';
import { TelegramModule } from './telegram.module';
import { NotificationComposerService } from '../services/notification-composer/notification-composer.service';
import { MessageComposerConstructors } from '../services/notification-composer/message-composers';
import { ChangesAnalyserService } from '../services/changes-analyser.service';
import { MessageAssignmentService } from '../services/message-assignment.service';
import { GitlabController } from '../controllers/gitlab-controller';
import { GiteaController } from '../controllers/gitea-contorller';
import { GiteaPayloadTimerService } from '../services/payload-timer.service';
import { PayloadCombiningService } from '../services/payload-combining.service';

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
    GiteaPayloadTimerService,
    PayloadCombiningService,
  ],
  controllers: [GitlabController, GiteaController],
  exports: [NotificationService],
})
export class NotificationModule {}
