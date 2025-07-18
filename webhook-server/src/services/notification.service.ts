import { Injectable } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { EventPayload } from '../types';
import { NotificationRecipientsService } from './notification-recipients.service';
import { ChangesAnalyserService } from './changes-analyser.service';
import { MessageAssignmentService } from './message-assignment.service';
import { NotificationComposerService } from './notification-composer/notification-composer.service';

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
    const recipients = await this.notificationRecipientsService.retrieveRecipientsList(eventPayload);

    if (!recipients || !recipients.length) {
      return;
    }

    const changes = this.changesAnalyser.parseEventChanges(eventPayload);

    if (!changes || !changes.length) {
      return;
    }

    const messages = this.notificationComposer.composeNotifications(changes);

    if (!messages || !messages.length) {
      return;
    }

    const recipientsWithMessages = this.messageAssignmentService.assignMessagesToRecipients(messages, recipients);

    const pendingNotifications = recipientsWithMessages.map((recipient) => {
      const notificationData = {
        message: recipient.message,
        chatId: recipient.instanceUsers.telegramUserId,
        subscriptionInfo: {
          ...recipient.observableObjects,
          uuid: recipient.uuid,
          instanceUserId: recipient.instanceUserId,
        },
      };
      return this.telegramService.sendNotification(notificationData);
    });

    await Promise.all(pendingNotifications);
  }
}
