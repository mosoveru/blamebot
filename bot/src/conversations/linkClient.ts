import { Keyboard } from 'grammy';
import { BlamebotConversation, ConversationInsideContext } from '@types';
import ReplyMessages from '@constants';
import { isValidHttpURL } from '@utils';

async function linkClient(conversation: BlamebotConversation, ctx: ConversationInsideContext) {
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
  if (isValidHttpURL(url)) {
    await ctx.reply(`Пришлите персональный токен доступа с правами на чтение пользователя.`);
    const token = await conversation.form.text({
      otherwise: (ctx) =>
        ctx.reply('Пришлите валидный токен доступа', {
          reply_markup: returnBack,
        }),
      action: (ctx) => ctx.deleteMessage(),
    });
    const testDbRequest = await conversation.external(async () => {
      const serviceUser = await ctx.dbService.getRemoteUserInfo('#####', '#######');
      if (!serviceUser) {
        return 'Банка не сработала';
      } else {
        return `Юзер: ${serviceUser.username}. Телеграм ID: ${serviceUser.telegramUserId}`;
      }
    });
    await ctx.reply(testDbRequest);
  } else {
    await ctx.reply('Вы прислали невалидный URL. Попробуйте ещё раз', {
      reply_markup: returnBack,
    });
    await conversation.rewind(checkpoint);
  }
}

export default linkClient;
