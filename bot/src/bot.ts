import { Bot, type Context, Keyboard } from 'grammy';
import { type Conversation, type ConversationFlavor, conversations, createConversation } from '@grammyjs/conversations';
import { SECRET_TOKEN, regexForURL } from './constants';
import ReplyMessages from './constants/text';

type OutsideContext = ConversationFlavor<Context>;

type InsideContext = Context;

type TgConversation = Conversation<OutsideContext, InsideContext>;

const bot = new Bot<OutsideContext>(SECRET_TOKEN);

bot.use(conversations());

bot.hears(ReplyMessages.GO_BACK, async (ctx) => {
  const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
  await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
    reply_markup: keyboard,
  });
  await ctx.conversation.exit('link');
});

bot.use(createConversation(link));

bot.command('start', async (ctx) => {
  const keyboard = new Keyboard().text('Связать клиент с сервисом').resized();
  await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
    reply_markup: keyboard,
  });
});

bot.hears(ReplyMessages.LINK_CLIENT, async (ctx) => {
  await ctx.conversation.enter('link');
});

bot.on('callback_query:data', async (ctx) => {
  await ctx.reply(`Callback data: ${ctx.callbackQuery.data}`);
});

async function link(conversation: TgConversation, ctx: InsideContext) {
  const returnBack = new Keyboard().text(ReplyMessages.GO_BACK).resized();
  await ctx.reply('Пожалуйста, пришлите URL для удалённого реестра репозиториев', {
    reply_markup: returnBack,
  });
  const checkpoint = conversation.checkpoint();
  const url = await conversation.form.text({
    otherwise: (ctx) =>
      ctx.reply('Нужно прислать текстовое сообщение с URL', {
        reply_markup: returnBack,
      }),
  });
  if (regexForURL.test(url)) {
    await ctx.reply(`Вы прислали валидный URL: ${url}`);
  } else {
    await ctx.reply('Вы прислали невалидный URL. Попробуйте ещё раз', {
      reply_markup: returnBack,
    });
    await conversation.rewind(checkpoint);
  }
}

void bot.start();

console.log('Telegram bot has been started!');
