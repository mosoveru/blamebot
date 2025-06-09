import { Bot } from 'grammy';
import { BlamebotContext } from '@types';
import { AppDataSource, Fetcher, GitApiHandlers, Linker } from '@services';
import buildLinkClientConversation from '@composers';
import PostgresDatabaseService from '@services';
import { Instance } from '@entities';
import { TelegramUser } from '@entities';
import { InstanceUser } from '@entities';
import Config from '@config';

(async () => {
  const bot = new Bot<BlamebotContext>(Config.get('BOT_SECRET_TOKEN'));

  const dataSource = await AppDataSource.initialize();
  const remoteServiceRepository = dataSource.getRepository(Instance);
  const telegramUserRepository = dataSource.getRepository(TelegramUser);
  const serviceUserRepository = dataSource.getRepository(InstanceUser);
  const databaseService = new PostgresDatabaseService(
    telegramUserRepository,
    serviceUserRepository,
    remoteServiceRepository,
  );
  const apiHandlers = GitApiHandlers.map((Handler) => new Handler());
  const fetcher = new Fetcher(apiHandlers);
  const linker = new Linker(databaseService);

  bot.use(buildLinkClientConversation(databaseService)(fetcher)(linker));

  bot.catch(async (error) => {
    await error.ctx.reply('Произошла неизвестная ошибка.');
  });

  bot.start({
    onStart: () => {
      console.log('Telegram bot has been started!');
    },
  });
})();
