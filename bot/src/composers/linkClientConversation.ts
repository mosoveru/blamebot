import { Composer, Keyboard } from 'grammy';
import { BlamebotContext, DatabaseService } from '../types';
import { conversations, createConversation } from '@grammyjs/conversations';
import ReplyMessages from '../constants/text';
import linkClient from '../conversations/linkClient';
import provideDatabaseService from '../middlewares/provideDatabaseService';

function initLinkClientConversation(databaseService: DatabaseService) {
  const composer = new Composer<BlamebotContext>();

  composer.use(provideDatabaseService(databaseService));

  composer.use(
    conversations({
      plugins: [provideDatabaseService(databaseService)],
    }),
  );

  composer.hears(ReplyMessages.GO_BACK, async (ctx) => {
    const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
    await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
      reply_markup: keyboard,
    });
    await ctx.conversation.exit(linkClient.name);
  });

  composer.use(createConversation(linkClient));

  composer.command('start', async (ctx) => {
    const keyboard = new Keyboard().text('Связать клиент с сервисом').resized();
    await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
      reply_markup: keyboard,
    });
  });

  composer.hears(ReplyMessages.LINK_CLIENT, async (ctx) => {
    await ctx.conversation.enter(linkClient.name);
  });

  composer.on('callback_query:data', async (ctx) => {
    await ctx.reply(`Callback data: ${ctx.callbackQuery.data}`);
  });

  return composer;
}

export default initLinkClientConversation;
