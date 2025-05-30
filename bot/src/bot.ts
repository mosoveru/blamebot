import { Bot } from 'grammy';
import { BlamebotContext } from '@types';
import { AppDataSource } from '@services';
import initLinkClientConversation from '@composers';
import PostgresDatabaseService from '@services';
import { Service } from '@entities';
import { TelegramUser } from '@entities';
import { ServiceUser } from '@entities';
import Config from '@config';

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

  bot.start({
    onStart: () => {
      console.log('Telegram bot has been started!');
    },
  });
})();
