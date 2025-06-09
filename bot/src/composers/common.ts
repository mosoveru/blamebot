import { BlamebotContext, DatabaseService } from '@types';
import { Composer, InlineKeyboard, Keyboard } from 'grammy';
import ReplyMessages from '@constants';
import provideDatabaseService from '@middlewares';

export function buildCommonComposer(dbService: DatabaseService) {
  const composer = new Composer<BlamebotContext>();

  composer.use(provideDatabaseService(dbService));

  composer.command('start', async (ctx) => {
    const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
    await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
      reply_markup: keyboard,
    });
  });

  composer.callbackQuery(/(?<=UNSUB=).+/, async (ctx) => {
    const id = ctx.callbackQuery.data.replace('UNSUB=', '');
    await ctx.dbService.unsubscribeUser(id);
    const subscribeAgain = new InlineKeyboard().text('Подписаться заново', `SUB=${id}`);
    await ctx.editMessageReplyMarkup({
      reply_markup: subscribeAgain,
    });
    await ctx.answerCallbackQuery('Вы успешно отписали от получения уведомлений на эту сущность!');
  });

  composer.callbackQuery(/(?<=SUB=).+/, async (ctx) => {
    const id = ctx.callbackQuery.data.replace('SUB=', '');
    await ctx.dbService.subscribeUser(id);
    const unsubscribe = new InlineKeyboard().text('Отписаться', `UNSUB=${id}`);
    await ctx.editMessageReplyMarkup({
      reply_markup: unsubscribe,
    });
    await ctx.answerCallbackQuery('Вы успешно подписались заново на получение уведомлений!');
  });

  return composer;
}
