import { Injectable } from '@nestjs/common';
import { GitRemoteHandlersRepository } from '../../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { TelegramService } from '../telegram/telegram.service';
import { ServiceName, ServiceType } from '../../types';
import { ObservableObjectService } from '../observable-object/observable-object.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { NotificationRecipientsService } from '../notification-recipients/notification-recipients.service';
import { ServiceUserService } from '../service-user/service-user.service';

@Injectable()
export class NotificationMediatorService {
  constructor(
    private readonly handlersRepository: GitRemoteHandlersRepository,
    private readonly telegramService: TelegramService,
    private readonly observableObjectService: ObservableObjectService,
    private readonly subscriptionService: SubscriptionService,
    private readonly notificationRecipientsService: NotificationRecipientsService,
    private readonly serviceUsersService: ServiceUserService,
  ) {}

  async notify(serviceName: ServiceName, serviceType: ServiceType<any>) {
    console.log(JSON.stringify(serviceName, null, 2), JSON.stringify(serviceType, null, 2));
    const handler = this.handlersRepository.getGitRemoteHandler(serviceType.service, serviceType.eventType);
    if (handler) {
      const objectInfo = handler.parseObservableObjectInfo(serviceType);
      const observableObjectEntity = {
        ...objectInfo,
        serviceId: serviceName.name,
      };
      await this.observableObjectService.ensureExists(observableObjectEntity);
      const subscriptions = await this.subscriptionService.findSubscribers(observableObjectEntity);
      const recipients = handler.parseEventMembersIds(serviceType);

      const usersToBeChecked = this.notificationRecipientsService.compareSubscriptionsWithEventMembers(
        subscriptions,
        recipients,
      );

      const subscribersWithActiveSubscription = subscriptions
        .filter((subscription) => subscription.isSubscribed)
        .map((subscription) => subscription.serviceUserId);

      const usersToBeNotified: string[] = [...subscribersWithActiveSubscription];

      const checkedServiceUsers = await this.serviceUsersService.ensureServiceUsersExists(
        usersToBeChecked,
        serviceName.name,
      );
      const checkedServiceUsersIds = checkedServiceUsers.map((serviceUser) => serviceUser.serviceUserId);

      if (checkedServiceUsers.length) {
        const pendingSubscriptions = checkedServiceUsers.map((serviceUser) => ({
          serviceId: serviceName.name,
          objectType: observableObjectEntity.objectType,
          projectId: observableObjectEntity.projectId,
          objectId: observableObjectEntity.objectId,
          serviceUserId: serviceUser.serviceUserId,
        }));

        await this.subscriptionService.subscribe(pendingSubscriptions);
        usersToBeNotified.push(...checkedServiceUsersIds);
      }

      const eventInitiatorId = handler.parseEventInitiatorId(serviceType);

      const usersToBeNotifiedWithoutInitiator = this.notificationRecipientsService.excludeInitiator(
        usersToBeNotified,
        eventInitiatorId,
      );

      const serviceUsers = await this.serviceUsersService.retrieveTelegramIds(
        usersToBeNotifiedWithoutInitiator,
        serviceName.name,
      );

      const notification = handler.composeNotification(serviceType);
      console.log(notification);
      console.log(recipients);
      for (const user of serviceUsers) {
        await this.telegramService.sendNotification(notification, user.telegramUserId);
      }
    } else {
      console.log("Handler isn't existing");
    }
  }
}
