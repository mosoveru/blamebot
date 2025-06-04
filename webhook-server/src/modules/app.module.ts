import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { TelegramUser } from '../models/telegram-user.entity';
import { NotificationModule } from './notification.module';
import { UserSubscription } from '../models/userSubscription.entity';
import { InstanceUser } from '../models/instanceUser.entity';
import { ObservableObject } from '../models/observable-object.entity';
import { Instance } from '../models/instance.entity';
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
        entities: [TelegramUser, UserSubscription, InstanceUser, ObservableObject, Project, Instance, ObjectType],
        synchronize: false,
        retryAttempts: 10,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    NotificationModule,
  ],
})
export class AppModule {}
