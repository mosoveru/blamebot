import { Keyboard } from 'grammy';
import { BlamebotConversation, ConversationInsideContext } from '@types';
import ReplyMessages from '@constants';
import { isValidHttpURL } from '@utils';
import { repliesForErrors } from '../constants/enums';
import { chooseGitProvider } from './chooseGitProvider';

async function linkClient(conversation: BlamebotConversation, ctx: ConversationInsideContext) {
  const returnBackButton = new Keyboard().text(ReplyMessages.GO_BACK).resized();
  const linkClientButton = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
  await ctx.reply('Пожалуйста, пришлите URL для удалённого реестра репозиториев', {
    reply_markup: returnBackButton,
  });
  const urlCheckpoint = conversation.checkpoint();
  const url = await conversation.form.text({
    otherwise: (ctx) =>
      ctx.reply('Нужно прислать текстовое сообщение с URL', {
        reply_markup: returnBackButton,
      }),
  });
  if (!isValidHttpURL(url)) {
    await ctx.reply('Вы прислали невалидный URL. Попробуйте ещё раз', {
      reply_markup: returnBackButton,
    });
    await conversation.rewind(urlCheckpoint);
  }
  const origin = new URL(url).origin;
  const chosenProvider = await chooseGitProvider(conversation, ctx);
  await ctx.reply('Пришлите персональный токен доступа', {
    reply_markup: returnBackButton,
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
    await ctx.reply(`Не получилось получить информацию о пользователе. ${repliesForErrors[instanceUserInfo.cause]}`, {
      reply_markup: linkClientButton,
    });
    return await conversation.halt();
  }
  const linkStatus = await conversation.external(async () => {
    return await ctx.linker.linkClient({
      telegramUserId: String(ctx.from?.id),
      telegramName: ctx.from?.first_name,
      telegramUsername: ctx.from?.username,
      instanceUsername: instanceUserInfo.username,
      instanceUserId: instanceUserInfo.instanceUserId,
      instanceUrl: origin,
      email: instanceUserInfo.email,
      pathname: instanceUserInfo.pathname,
    });
  });
  if (!linkStatus.ok) {
    await ctx.reply(repliesForErrors[linkStatus.cause], {
      reply_markup: linkClientButton,
    });
    await conversation.halt();
  }
  await ctx.reply(
    'Вы успешно связали клиент с удалённым репозиторием! Теперь вы будете получать уведомления о событиях',
    {
      reply_markup: linkClientButton,
    },
  );
  await conversation.halt();
}

export default linkClient;
