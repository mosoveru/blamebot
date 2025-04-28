import { Injectable } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { EventPayload } from '../../types';
import { NotificationRecipientsService } from '../notification-recipients/notification-recipients.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly notificationRecipientsService: NotificationRecipientsService,
  ) {}

  async notify(eventPayload: EventPayload<any>) {
    console.log(JSON.stringify(eventPayload, null, 2), JSON.stringify(eventPayload, null, 2));

    const recipients = await this.notificationRecipientsService.retrieveRecipientsList(eventPayload);

    if (!recipients || !recipients.length) {
      return;
    }

    // for (const user of serviceUsers) {
    //   const notificationData = {
    //     message: notification,
    //     chatId: user.telegramUserId,
    //     subscriptionInfo: {
    //       ...objectEntity,
    //       serviceUserId: user.serviceUserId,
    //     },
    //   };
    //   await this.telegramService.sendNotification(notificationData);
    // }

    console.log(recipients);
  }
}
