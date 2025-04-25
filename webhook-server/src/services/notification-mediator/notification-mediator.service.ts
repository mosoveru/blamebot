import { Injectable } from '@nestjs/common';
import { GitRemoteHandlersRepository } from '../../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { TelegramService } from '../telegram/telegram.service';
import { EventPayload } from '../../types';
import { NotificationRecipientsService } from '../notification-recipients/notification-recipients.service';

@Injectable()
export class NotificationMediatorService {
  constructor(
    private readonly handlersRepository: GitRemoteHandlersRepository,
    private readonly telegramService: TelegramService,
    private readonly notificationRecipientsService: NotificationRecipientsService,
  ) {}

  async notify(eventPayload: EventPayload<any>) {
    console.log(JSON.stringify(serviceName, null, 2), JSON.stringify(eventPayload, null, 2));
    const handler = this.handlersRepository.getGitRemoteHandler(eventPayload.service, eventPayload.eventType);
    if (handler) {
      const objectInfo = handler.parseObservableObjectInfo(eventPayload);
      const objectEntity = {
        ...objectInfo,
        serviceId: serviceName.name,
      };
      const eventMembersIds = handler.parseEventMembersIds(eventPayload);
      const eventInitiatorId = handler.parseEventInitiatorId(eventPayload);

      const serviceUsers = await this.notificationRecipientsService.retrieveRecipientsList({
        eventMembersIds,
        objectEntity,
        eventInitiatorId,
      });

      if (!serviceUsers.length) {
        return;
      }

      const notification = handler.composeNotification({
        ...eventPayload,
        ...serviceName,
      });
      console.log(notification);
      console.log(eventMembersIds);
      for (const user of serviceUsers) {
        const notificationData = {
          message: notification,
          chatId: user.telegramUserId,
          subscriptionInfo: {
            ...objectEntity,
            serviceUserId: user.serviceUserId,
          },
        };
        await this.telegramService.sendNotification(notificationData);
      }
    } else {
      console.log("Handler isn't existing");
    }
  }
}
