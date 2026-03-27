import { Logger, Module } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Api } from 'grammy';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TelegramService,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('TelegramModule');
        const token = configService.get<string>('BOT_SECRET_TOKEN');
        if (!token) {
          throw new Error('Bot secret token is not defined in .env file.');
        }
        const useProxy = configService.get<boolean>('USE_PROXY');
        if (useProxy) {
          logger.log('Using proxy');
          const connectionURL = configService.get<string>('PROXY_URL')!;
          const { SocksProxyAgent } = require('socks-proxy-agent');
          const socksAgent = new SocksProxyAgent(connectionURL);
          const telegramApi = new Api(token, {
            baseFetchConfig: {
              agent: socksAgent,
            },
          });
          return new TelegramService(telegramApi);
        }
        logger.log('Using API without proxy');
        const telegramApi = new Api(token);
        return new TelegramService(telegramApi);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
