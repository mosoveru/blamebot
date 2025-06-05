import { InlineKeyboard, Keyboard } from 'grammy';
import { BlamebotConversation, ConversationInsideContext } from '@types';
import ReplyMessages, { GitProviders } from '@constants';
import { isValidHttpURL } from '@utils';

async function linkClient(conversation: BlamebotConversation, ctx: ConversationInsideContext) {
  const returnBack = new Keyboard().text(ReplyMessages.GO_BACK).resized();
  await ctx.reply('Пожалуйста, пришлите URL для удалённого реестра репозиториев', {
    reply_markup: returnBack,
  });
  const urlCheckpoint = conversation.checkpoint();
  const url = await conversation.form.text({
    otherwise: (ctx) =>
      ctx.reply('Нужно прислать текстовое сообщение с URL', {
        reply_markup: returnBack,
      }),
  });
  if (!isValidHttpURL(url)) {
    await ctx.reply('Вы прислали невалидный URL. Попробуйте ещё раз', {
      reply_markup: returnBack,
    });
    await conversation.rewind(urlCheckpoint);
  }
  const origin = new URL(url).origin;
  const gitProvidersKeyboard = new InlineKeyboard()
    .text('GitLab', GitProviders.GITLAB)
    .row()
    .text('Gitea', GitProviders.GITEA);
  const gitProvidersMessage = await ctx.reply('Выберите провайдера Git', {
    reply_markup: gitProvidersKeyboard,
  });
  const gitProviderChoiceCheckpoint = conversation.checkpoint();
  const answer = await conversation.wait();
  const isNotSameMessage = gitProvidersMessage.message_id !== answer.callbackQuery?.message?.message_id;
  const isCallbackDataNotExist = !(!!answer.callbackQuery && !!answer.callbackQuery.data);
  if (isNotSameMessage && isCallbackDataNotExist) {
    await conversation.rewind(gitProviderChoiceCheckpoint);
  }
  const chosenProvider = answer.callbackQuery!.data! as GitProviders;
  await answer.editMessageReplyMarkup({
    reply_markup: undefined,
  });
  await answer.editMessageText(`Вы выбрали ${chosenProvider}`);
  await ctx.reply('Пришлите персональный токен доступа', {
    reply_markup: returnBack,
  });
  const token = await conversation.form.text({
    otherwise: (ctx) => ctx.reply('Пришлите текст с токеном доступа'),
    action: (ctx) => ctx.deleteMessage(),
  });
  console.log(token);
  const instanceUserInfo = await conversation.external(async () => {
    return await ctx.fetcher.fetchUserData({
      origin,
      token,
      provider: chosenProvider,
    });
  });
  if (instanceUserInfo.ok) {
    await ctx.reply(`Instance User Id ${instanceUserInfo.instanceUserId}, username ${instanceUserInfo.username}`);
  } else {
    await ctx.reply(`Не получилось получить информацию о пользователе. По причине: ${instanceUserInfo.message}`);
  }
}

export default linkClient;
