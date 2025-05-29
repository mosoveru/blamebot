import { Bot } from 'grammy';
import { SECRET_TOKEN } from './constants';
import { BlamebotContext } from './types';
import { AppDataSource } from './services/data-source';
import initLinkClientConversation from './composers/linkClientConversation';
import PostgresDatabaseService from './services/PostgresDatabaseService';
import { Service } from './entities/service.entity';
import { TelegramUser } from './entities/telegram-user.service';
import { ServiceUser } from './entities/service-user.entity';

(async () => {
  const bot = new Bot<BlamebotContext>(SECRET_TOKEN);

  const dataSource = await AppDataSource.initialize();
  const remoteServiceRepository = dataSource.getRepository(Service);
  const telegramUserRepository = dataSource.getRepository(TelegramUser);
  const serviceUserRepository = dataSource.getRepository(ServiceUser);
  const databaseService = new PostgresDatabaseService(
    telegramUserRepository,
    serviceUserRepository,
    remoteServiceRepository,
  );

  bot.use(initLinkClientConversation(databaseService));

  bot.catch(async (error) => {
    await error.ctx.reply('Произошла ошибка');
  });

  bot.start();
  console.log('Telegram bot has been started!');
})();
