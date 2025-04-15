import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { Subscriber } from '../models/subscriber.entity';
import { ChatModule } from './chat.module';
import { TelegramModule } from './telegram.module';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';
import { HandlersModule } from './handlers.module';

type DataBaseType = 'postgres';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<DataBaseType>('DB_DRIVER'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('PORT'),
        username: configService.get<string>('DB_USER_LOGIN'),
        password: configService.get<string>('DB_USER_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Subscriber],
        synchronize: false,
        retryAttempts: 10,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ChatModule,
    TelegramModule,
    HandlersModule,
  ],
  controllers: [WebhookController],
  providers: [NotificationMediatorService],
})
export class AppModule {}
