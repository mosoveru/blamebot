import { BlamebotConversation, ConversationInsideContext } from '@types';
import ReplyMessages, { repliesForErrors } from '@constants';
import { chooseGitProvider } from './chooseGitProvider';
import { isValidHttpURL } from '@utils';

export async function createInstance(conversation: BlamebotConversation, ctx: ConversationInsideContext) {
  await ctx.reply(ReplyMessages.NAME_FOR_NEW_INSTANCE);
  const instanceName = await conversation.form.text({
    otherwise: (ctx) => ctx.reply('Пожалуйста, напишите текст с именем инстанса'),
  });
  const chosenProvider = await chooseGitProvider(conversation, ctx);
  await ctx.reply('Пришлите URL инстанса.');
  const urlCheckpoint = conversation.checkpoint();
  const url = await conversation.form.text({
    otherwise: (ctx) => ctx.reply('Нужно прислать текстовое сообщение с URL'),
  });
  if (!isValidHttpURL(url)) {
    await ctx.reply('Вы прислали невалидный URL. Попробуйте ещё раз');
    await conversation.rewind(urlCheckpoint);
  }
  const instanceCreationResult = await conversation.external(async () => {
    return ctx.manager.saveNewInstance({
      instanceName,
      gitProvider: chosenProvider,
      serviceBaseUrl: new URL(url).origin,
    });
  });
  if (!instanceCreationResult.ok) {
    await ctx.reply(`${repliesForErrors[instanceCreationResult.cause]}`);
    await conversation.halt();
  } else {
    await ctx.reply(
      `Новый инстанс создан! Используйте следующий JWT токен для настройки вебхуков в репозитории:\n\n<code>${instanceCreationResult.jwt}</code>`,
      {
        parse_mode: 'HTML',
      },
    );
  }
}
