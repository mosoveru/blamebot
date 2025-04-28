import { Injectable } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { EventPayload } from '../../types';
import { NotificationRecipientsService } from '../notification-recipients/notification-recipients.service';
import { ChangesAnalyserService } from '../changes-analyser/changes-analyser.service';
import { MessageAssignmentService } from '../message-assignment/message-assignment.service';
import { NotificationComposerService } from '../notification-composer/notification-composer.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly notificationRecipientsService: NotificationRecipientsService,
    private readonly changesAnalyser: ChangesAnalyserService,
    private readonly messageAssignmentService: MessageAssignmentService,
    private readonly notificationComposer: NotificationComposerService,
  ) {}

  async notify(eventPayload: EventPayload<any>) {
    console.log(JSON.stringify(eventPayload, null, 2), JSON.stringify(eventPayload, null, 2));

    const recipients = await this.notificationRecipientsService.retrieveRecipientsList(eventPayload);

    if (!recipients || !recipients.length) {
      return;
    }

    const changes = this.changesAnalyser.parseEventChanges(eventPayload);

    if (!changes) {
      return;
    }

    const messages = this.notificationComposer.composeNotification(changes);

    const recipientsWithMessages = this.messageAssignmentService.assignMessageToRecipient(messages, recipients);

    console.log(recipientsWithMessages);

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
