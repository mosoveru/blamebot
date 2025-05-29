import { Module } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Api } from 'grammy';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TelegramService,
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('BOT_SECRET_TOKEN');
        if (!token) {
          throw new Error('Bot secret token is not defined in .env file.');
        }
        const telegramApi = new Api(token);
        return new TelegramService(telegramApi);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
