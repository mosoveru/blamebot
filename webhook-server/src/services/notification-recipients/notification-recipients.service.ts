import { Injectable } from '@nestjs/common';
import { Subscription } from 'src/models/subscription.entity';

@Injectable()
export class NotificationRecipientsService {
  compareSubscriptionsWithEventMembers(subscriptions: Subscription[], membersIds: number[]) {
    const toBeChecked: string[] = [];
    const ids = membersIds.map((id) => String(id));
    const subscriptionsIds = subscriptions.map((subscription) => subscription.serviceUserId);
    ids.forEach((id) => {
      if (!subscriptionsIds.includes(id)) {
        toBeChecked.push(id);
      }
    });
    return toBeChecked;
  }

  excludeInitiator(usersToBeNotified: string[], initiatorId: string) {
    return usersToBeNotified.filter((userId) => userId !== initiatorId);
  }
}
