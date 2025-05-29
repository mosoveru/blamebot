import { Bot } from 'grammy';
import { BlamebotContext } from './types';
import { AppDataSource } from './services/data-source';
import initLinkClientConversation from './composers/linkClientConversation';
import PostgresDatabaseService from './services/PostgresDatabaseService';
import { Service } from './entities/service.entity';
import { TelegramUser } from './entities/telegram-user.service';
import { ServiceUser } from './entities/service-user.entity';
import Config from './config';

(async () => {
  const bot = new Bot<BlamebotContext>(Config.get('BOT_SECRET_TOKEN'));

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

  void bot.start({
    onStart: () => {
      console.log('Telegram bot has been started!');
    },
  });
})();
