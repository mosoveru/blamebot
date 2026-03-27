import { Bot } from 'grammy';
import { BlamebotContext } from '@types';
import { AppDataSource, Fetcher, GitApiHandlers, InstanceManager, Linker } from '@services';
import buildLinkClientConversation, { buildAdminComposer, buildCommonComposer } from '@composers';
import PostgresDatabaseService from '@services';
import { Instance, UserSubscription } from '@entities';
import { TelegramUser } from '@entities';
import { InstanceUser } from '@entities';
import Config from '@config';
import { Router } from '@grammyjs/router';
import provideDatabaseService, { helloReply } from '@middlewares';

(async () => {
  let bot;
  if (Config.get('USE_PROXY')) {
    console.log('[TelegramBot]: Using proxy');
    const { SocksProxyAgent } = require('socks-proxy-agent');
    const socksAgent = new SocksProxyAgent(Config.get('PROXY_URL'));
    bot = new Bot<BlamebotContext>(Config.get('BOT_SECRET_TOKEN'), {
      client: {
        baseFetchConfig: {
          agent: socksAgent,
        },
      },
    });
  } else {
    console.log('[TelegramBot]: Bot is starting without proxy');
    bot = new Bot<BlamebotContext>(Config.get('BOT_SECRET_TOKEN'));
  }

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
  const secretJwtKey = Config.get('PRIVATE_JWT_KEY');
  const instanceManager = new InstanceManager(databaseService, secretJwtKey);

  bot.use(provideDatabaseService(databaseService));
  const router = new Router<BlamebotContext>(async (ctx) => {
    const isAdmin = !!ctx.chatId && (await ctx.dbService.isTgUserAdmin(String(ctx.chatId)));
    if (isAdmin) {
      return 'admin';
    }
  });

  router.route(
    'admin',
    helloReply('admin'),
    buildCommonComposer(databaseService),
    buildAdminComposer(fetcher)(linker)(instanceManager),
  );
  router.otherwise(
    helloReply('user'),
    buildCommonComposer(databaseService),
    buildLinkClientConversation(fetcher)(linker),
  );

  bot.use(router);

  bot.catch(async (error) => {
    await error.ctx.reply('Произошла неизвестная ошибка.');
  });

  bot.start({
    onStart: () => {
      console.log('[TelegramBot]: Telegram bot has been started!');
    },
  });
})();
