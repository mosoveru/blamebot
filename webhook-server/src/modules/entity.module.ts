import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUser } from '../models/service-user.entity';
import { Subscription } from '../models/subscription.entity';
import { TelegramUser } from '../models/telegram-user.entity';
import { ObservableObject } from '../models/observable-object.entity';
import { Project } from '../models/project.entity';
import { ObservableObjectService } from '../services/observable-object.service';
import { ServiceUserService } from '../services/service-user.service';
import { SubscriptionService } from '../services/subscription.service';
import { ProjectService } from '../services/project.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceUser, Subscription, TelegramUser, ObservableObject, Project])],
  providers: [ObservableObjectService, ServiceUserService, SubscriptionService, SubscriptionService, ProjectService],
  exports: [ObservableObjectService, ServiceUserService, SubscriptionService, SubscriptionService, ProjectService],
})
export class EntityModule {}
