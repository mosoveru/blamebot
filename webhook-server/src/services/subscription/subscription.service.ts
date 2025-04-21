import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../../models/subscription.entity';
import { Repository } from 'typeorm';
import { PendingSubscription, TObservableObjectEntity } from '../../types';

@Injectable()
export class SubscriptionService {
  constructor(@InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>) {}

  async subscribe(pendingSubscriptions: PendingSubscription[]) {
    if (pendingSubscriptions.length) {
      const valuesToBeInserted = pendingSubscriptions.map((subscription) => ({
        ...subscription,
        isSubscribed: true,
      }));
      await this.subscriptionRepository.insert(valuesToBeInserted);
    }
  }

  async findSubscribers(observableObject: Omit<TObservableObjectEntity, 'objectUrl'>) {
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
