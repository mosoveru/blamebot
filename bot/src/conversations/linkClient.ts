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
  const instanceUserInfo = await conversation.external(async () => {
    return await ctx.fetcher.fetchUserData({
      origin,
      token,
      provider: chosenProvider,
    });
  });
  if (!instanceUserInfo.ok) {
    return await ctx.reply(`Не получилось получить информацию о пользователе. По причине: ${instanceUserInfo.message}`);
  }
  const linkStatus = await conversation.external(async () => {
    const isTelegramUserInfoNotExist = !(!!ctx.from?.id && !!ctx.from.username);
    if (isTelegramUserInfoNotExist) {
      console.log('Telegram Info Not Exist!');
      return false;
    }
    return await ctx.linker.linkClient({
      telegramUserId: String(ctx.from!.id),
      telegramName: ctx.from.first_name,
      telegramUsername: ctx.from.username!,
      instanceUsername: instanceUserInfo.username,
      instanceUserId: instanceUserInfo.instanceUserId,
      instanceUrl: origin,
      email: instanceUserInfo.email,
      pathname: instanceUserInfo.pathname,
    });
  });
  if (linkStatus) {
    await ctx.reply(
      'Вы успешно связали клиент с удалённым репозиторием! Теперь вы будете получать уведомления о событиях',
      {
        reply_markup: new Keyboard().text(ReplyMessages.LINK_CLIENT).resized(),
      },
    );
    await conversation.halt();
  } else {
    await ctx.reply('Не удалось связать клиент в результате непредвиденной ошибки');
    await conversation.halt();
  }
}

export default linkClient;
