import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../../models/subscription.entity';
import { Repository } from 'typeorm';
import { PendingSubscription, TObservableObject } from '../../types';

@Injectable()
export class SubscriptionService {
  constructor(@InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>) {}

  async subscribe(pendingSubscriptions: PendingSubscription[]) {
    if (pendingSubscriptions.length) {
      for (const pendingSubscription of pendingSubscriptions) {
        const adaptedPendingSubscription = {
          serviceId: String(pendingSubscription.serviceId)!,
          projectId: String(pendingSubscription.projectId),
          objectId: String(pendingSubscription.objectId),
          serviceUserId: String(pendingSubscription.serviceUserId),
          isSubscribed: true,
        };
        this.subscriptionRepository.create(adaptedPendingSubscription);
      }
    }
  }

  async findSubscribers(observableObject: TObservableObject) {
    return await this.subscriptionRepository.find({
      where: {
        objectId: String(observableObject.objectId),
        serviceId: String(observableObject.serviceId),
        projectId: String(observableObject.projectId),
        objectType: String(observableObject.objectType),
      },
    });
  }
}
