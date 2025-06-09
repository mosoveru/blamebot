import { Bot } from 'grammy';
import { BlamebotContext } from '@types';
import { AppDataSource, Fetcher, GitApiHandlers, Linker } from '@services';
import buildLinkClientConversation, { buildCommonComposer } from '@composers';
import PostgresDatabaseService from '@services';
import { Instance, UserSubscription } from '@entities';
import { TelegramUser } from '@entities';
import { InstanceUser } from '@entities';
import Config from '@config';

(async () => {
  const bot = new Bot<BlamebotContext>(Config.get('BOT_SECRET_TOKEN'));

  const dataSource = await AppDataSource.initialize();
  const remoteServiceRepository = dataSource.getRepository(Instance);
  const telegramUserRepository = dataSource.getRepository(TelegramUser);
  const serviceUserRepository = dataSource.getRepository(InstanceUser);
  const subscriptionsRepository = dataSource.getRepository(UserSubscription);
  const databaseService = new PostgresDatabaseService(
    telegramUserRepository,
    serviceUserRepository,
    remoteServiceRepository,
    subscriptionsRepository,
  );
  const apiHandlers = GitApiHandlers.map((Handler) => new Handler());
  const fetcher = new Fetcher(apiHandlers);
  const linker = new Linker(databaseService);

  bot.use(buildCommonComposer(databaseService));
  bot.use(buildLinkClientConversation(fetcher)(linker));

  bot.catch(async (error) => {
    await error.ctx.reply('Произошла неизвестная ошибка.');
  });

  bot.start({
    onStart: () => {
      console.log('Telegram bot has been started!');
    },
  });
})();
