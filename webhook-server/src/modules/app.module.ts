import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { Subscriber } from '../models/subscriber.entity';
import { TelegramModule } from './telegram.module';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';
import { HandlersModule } from './handlers.module';
import { NotificationModule } from './notification.module';
import { RepositoryModule } from './repository.module';
import { Subscription } from '../models/subscription.entity';
import { ServiceUser } from '../models/service-user.entity';
import { ObservableObject } from '../models/observable-object.entity';
import { Service } from '../models/service.entity';
import { Project } from '../models/project.entity';
import { ObjectType } from '../models/object-type.entity';

type DataBaseType = 'postgres';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<DataBaseType>('DB_DRIVER')!,
        host: configService.get<string>('DB_HOST')!,
        port: configService.get<number>('PORT')!,
        username: configService.get<string>('DB_USER_LOGIN')!,
        password: configService.get<string>('DB_USER_PASSWORD')!,
        database: configService.get<string>('DB_NAME')!,
        entities: [Subscriber, Subscription, ServiceUser, ObservableObject, Project, Service, ObjectType],
        synchronize: false,
        retryAttempts: 10,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    NotificationModule,
    RepositoryModule,
    TelegramModule,
    HandlersModule,
  ],
  controllers: [WebhookController],
  providers: [NotificationMediatorService],
})
export class AppModule {}
