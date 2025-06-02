import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../models/subscription.entity';
import { Repository } from 'typeorm';
import { SubscriptionIdentifier, ObservableObjectEntity } from '../types';
import { ServiceUserService } from './service-user.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>,
    private readonly serviceUserService: ServiceUserService,
  ) {}

  async subscribeNewEventMembers(observableObject: ObservableObjectEntity, eventMembersIds: number[]) {
    const existingSubscriptions = await this.findExistingSubscriptions(observableObject);

    const usersToBeChecked = this.compareExistingSubscriptionsWithEventMembers(existingSubscriptions, eventMembersIds);

    const checkedServiceUsers = await this.serviceUserService.ensureServiceUsersExists(
      usersToBeChecked,
      observableObject.instanceId,
    );

    if (checkedServiceUsers.length) {
      const usersToBeSubscribed = checkedServiceUsers.map((serviceUser) => ({
        ...observableObject,
        instanceUserId: serviceUser.instanceUserId,
      }));

      await this.createSubscription(usersToBeSubscribed);
    }
  }

  async createSubscription(usersToBeSubscribed: SubscriptionIdentifier[]) {
    if (usersToBeSubscribed.length) {
      const valuesToBeInserted = usersToBeSubscribed.map((subscription) => ({
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
        instanceId: String(observableObject.instanceId),
        projectId: String(observableObject.projectId),
        objectType: String(observableObject.objectType),
        isSubscribed: true,
      },
      relations: {
        observableObjects: true,
        instanceUsers: true,
      },
    });
  }

  private async findExistingSubscriptions(observableObject: ObservableObjectEntity) {
    return await this.subscriptionRepository.find({
      where: {
        objectId: String(observableObject.objectId),
        instanceId: String(observableObject.instanceId),
        projectId: String(observableObject.projectId),
        objectType: String(observableObject.objectType),
      },
    });
  }

  private compareExistingSubscriptionsWithEventMembers(subscriptions: Subscription[], membersIds: number[]) {
    const toBeChecked: string[] = [];
    const ids = membersIds.map((id) => String(id));
    const subscriptionsIds = subscriptions.map((subscription) => subscription.instanceUserId);
    ids.forEach((id) => {
      if (!subscriptionsIds.includes(id)) {
        toBeChecked.push(id);
      }
    });
    return toBeChecked;
  }
}
