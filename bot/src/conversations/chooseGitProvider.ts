import { BlamebotConversation, ConversationInsideContext } from '@types';
import { GitProviders } from '@constants';
import { InlineKeyboard } from 'grammy';

export async function chooseGitProvider(conversation: BlamebotConversation, ctx: ConversationInsideContext) {
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
  return chosenProvider;
}
