import { Injectable } from '@nestjs/common';
import { Subscription } from 'src/models/subscription.entity';
import { TObservableObjectEntity } from '../../types';
import { SubscriptionService } from '../subscription/subscription.service';
import { ObservableObjectService } from '../observable-object/observable-object.service';
import { ServiceUserService } from '../service-user/service-user.service';

type TRetrieveMethodRequiredData = {
  objectEntity: TObservableObjectEntity;
  eventInitiatorId: string;
  eventMembersIds: number[];
};

@Injectable()
export class NotificationRecipientsService {
  constructor(
    private readonly serviceUserService: ServiceUserService,
    private readonly observableObjectService: ObservableObjectService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async retrieveRecipientsList(data: TRetrieveMethodRequiredData) {
    await this.observableObjectService.ensureExists(data.objectEntity);
    const subscriptions = await this.subscriptionService.findSubscribers(data.objectEntity);

    const usersToBeChecked = this.compareSubscriptionsWithEventMembers(subscriptions, data.eventMembersIds);

    const subscribersWithActiveSubscription = subscriptions
      .filter((subscription) => subscription.isSubscribed)
      .map((subscription) => subscription.serviceUserId);

    const usersToBeNotified: string[] = [...subscribersWithActiveSubscription];

    const checkedServiceUsers = await this.serviceUserService.ensureServiceUsersExists(
      usersToBeChecked,
      data.objectEntity.serviceId,
    );
    const checkedServiceUsersIds = checkedServiceUsers.map((serviceUser) => serviceUser.serviceUserId);

    if (checkedServiceUsers.length) {
      const pendingSubscriptions = checkedServiceUsers.map((serviceUser) => ({
        ...data.objectEntity,
        serviceUserId: serviceUser.serviceUserId,
      }));

      await this.subscriptionService.subscribe(pendingSubscriptions);
      usersToBeNotified.push(...checkedServiceUsersIds);
    }

    const usersToBeNotifiedWithoutInitiator = this.excludeInitiator(usersToBeNotified, data.eventInitiatorId);

    return await this.serviceUserService.retrieveTelegramIds(
      usersToBeNotifiedWithoutInitiator,
      data.objectEntity.serviceId,
    );
  }

  private compareSubscriptionsWithEventMembers(subscriptions: Subscription[], membersIds: number[]) {
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

  private excludeInitiator(usersToBeNotified: string[], initiatorId: string) {
    return usersToBeNotified.filter((userId) => userId !== initiatorId);
  }
}
