import { BlamebotContext, ExternalGitSystemDataFetcher, LinkingService } from '@types';
import { Composer, Keyboard } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { provideFetcher, provideInstanceManager, provideLinker } from '@middlewares';
import ReplyMessages from '@constants';
import linkClient, { createInstance } from '@conversations';
import { InstanceManager } from '@services';

export function buildAdminComposer(fetcher: ExternalGitSystemDataFetcher) {
  return function (linker: LinkingService) {
    return function (manager: InstanceManager) {
      const composer = new Composer<BlamebotContext>();

      composer.use(
        conversations({
          plugins: [provideFetcher(fetcher), provideLinker(linker), provideInstanceManager(manager)],
        }),
      );

      composer.hears(ReplyMessages.GO_BACK, async (ctx) => {
        const keyboard = new Keyboard()
          .text(ReplyMessages.LINK_CLIENT)
          .row()
          .text(ReplyMessages.CREATE_NEW_INSTANCE)
          .resized();
        await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
          reply_markup: keyboard,
        });
        await ctx.conversation.exit(linkClient.name);
      });

      composer.use(createConversation(linkClient), createConversation(createInstance));

      composer.hears(ReplyMessages.LINK_CLIENT, async (ctx) => {
        await ctx.conversation.enter(linkClient.name);
      });

      composer.hears(ReplyMessages.CREATE_NEW_INSTANCE, async (ctx) => {
        await ctx.conversation.enter(createInstance.name);
      });

      return composer;
    };
  };
}
