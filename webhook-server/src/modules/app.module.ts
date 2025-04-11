import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhookController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { TOKENS } from '../constants/tokens';

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
        entities: [],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [WebhookController],
  providers: [],
})
export class AppModule {}
