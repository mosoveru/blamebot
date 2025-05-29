import { Injectable } from '@nestjs/common';
import { NotificationMessage } from '../types';
import { Subscription } from '../models/subscription.entity';

type SubscriptionWithMessage = Subscription & {
  message: string;
};

@Injectable()
export class MessageAssignmentService {
  assignMessagesToRecipients(
    messages: NotificationMessage[],
    subscriptions: Subscription[],
  ): SubscriptionWithMessage[] {
    const individualMessages = messages.filter((message) => message.serviceUserId);
    // Common message
    const { message } = messages.find((message) => !message.serviceUserId)!;

    return subscriptions.map((subscription) => {
      const messageForSubscription = individualMessages.find(
        (message) => message.serviceUserId === subscription.serviceUserId,
      );
      if (messageForSubscription) {
        return Object.assign(subscription, { message: messageForSubscription.message });
      } else {
        return Object.assign(subscription, { message });
      }
    });
  }
}
