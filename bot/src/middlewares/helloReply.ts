import { Composer, Keyboard } from 'grammy';
import ReplyMessages from '@constants';
import { BlamebotContext } from '@types';

type MeantFor = 'admin' | 'user';

export function helloReply(meantFor: MeantFor) {
  const composer = new Composer<BlamebotContext>();
  if (meantFor === 'admin') {
    composer.command('start', async (ctx) => {
      const keyboard = new Keyboard()
        .text(ReplyMessages.LINK_CLIENT)
        .row()
        .text(ReplyMessages.CREATE_NEW_INSTANCE)
        .resized();
      await ctx.reply(ReplyMessages.HELLO_ADMIN_MESSAGE, {
        reply_markup: keyboard,
      });
    });
    return composer;
  }
  composer.command('start', async (ctx) => {
    const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
    await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
      reply_markup: keyboard,
    });
  });
  return composer;
}
