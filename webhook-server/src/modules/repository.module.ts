import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUser } from '../models/service-user.entity';
import { Subscription } from '../models/subscription.entity';
import { Subscriber } from '../models/subscriber.entity';
import { ObservableObject } from '../models/observable-object.entity';
import { ObservableObjectService } from '../services/observable-object/observable-object.service';
import { ServiceUserService } from '../services/service-user/service-user.service';
import { SubscriptionService } from '../services/subscription/subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceUser, Subscription, Subscriber, ObservableObject])],
  providers: [ObservableObjectService, ServiceUserService, SubscriptionService, SubscriptionService],
  exports: [ObservableObjectService, ServiceUserService, SubscriptionService, SubscriptionService],
})
export class RepositoryModule {}
