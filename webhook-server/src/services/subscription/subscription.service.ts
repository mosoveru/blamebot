import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../../models/subscription.entity';
import { Repository } from 'typeorm';
import { SubscriptionIdentifier, ObservableObjectEntity } from '../../types';
import { ServiceUserService } from '../service-user/service-user.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>,
    private readonly serviceUserService: ServiceUserService,
  ) {}

  async subscribeNewEventMembers(observableObject: ObservableObjectEntity, eventMembersIds: number[]) {
    const subscriptions = await this.findSubscriptions(observableObject);

    const usersToBeChecked = this.compareSubscriptionsWithEventMembers(subscriptions, eventMembersIds);

    const checkedServiceUsers = await this.serviceUserService.ensureServiceUsersExists(
      usersToBeChecked,
      observableObject.serviceId,
    );

    if (checkedServiceUsers.length) {
      const pendingSubscriptions = checkedServiceUsers.map((serviceUser) => ({
        ...observableObject,
        serviceUserId: serviceUser.serviceUserId,
      }));

      await this.createSubscription(pendingSubscriptions);
    }
  }

  async createSubscription(pendingSubscriptions: SubscriptionIdentifier[]) {
    if (pendingSubscriptions.length) {
      const valuesToBeInserted = pendingSubscriptions.map((subscription) => ({
        ...subscription,
        isSubscribed: true,
      }));
      await this.subscriptionRepository.insert(valuesToBeInserted);
    }
  }

  async retrieveActiveSubscriptions(observableObject: ObservableObjectEntity) {
    return await this.subscriptionRepository.find({
      where: {
        objectId: String(observableObject.objectId),
        serviceId: String(observableObject.serviceId),
        projectId: String(observableObject.projectId),
        objectType: String(observableObject.objectType),
        isSubscribed: true,
      },
      relations: {
        observableObjects: true,
        serviceUsers: true,
      },
    });
  }

  private async findSubscriptions(observableObject: ObservableObjectEntity) {
    return await this.subscriptionRepository.find({
      where: {
        objectId: String(observableObject.objectId),
        serviceId: String(observableObject.serviceId),
        projectId: String(observableObject.projectId),
        objectType: String(observableObject.objectType),
      },
    });
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
}
