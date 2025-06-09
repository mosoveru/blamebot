import { Composer, Keyboard } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { BlamebotContext, ExternalGitSystemDataFetcher, LinkingService } from '@types';
import linkClient from '@conversations';
import { provideFetcher, provideLinker } from '@middlewares';
import ReplyMessages from '@constants';

function buildLinkClientConversation(fetcher: ExternalGitSystemDataFetcher) {
  return function (linker: LinkingService) {
    const composer = new Composer<BlamebotContext>();

    composer.use(
      conversations({
        plugins: [provideFetcher(fetcher), provideLinker(linker)],
      }),
    );

    composer.hears(ReplyMessages.GO_BACK, async (ctx) => {
      const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
      await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
        reply_markup: keyboard,
      });
      await ctx.conversation.exit(linkClient.name);
    });

    composer.use(createConversation(linkClient));

    composer.command('start', async (ctx) => {
      const keyboard = new Keyboard().text(ReplyMessages.LINK_CLIENT).resized();
      await ctx.reply(ReplyMessages.HELLO_MESSAGE, {
        reply_markup: keyboard,
      });
    });

    composer.hears(ReplyMessages.LINK_CLIENT, async (ctx) => {
      await ctx.conversation.enter(linkClient.name);
    });

    return composer;
  };
}

export default buildLinkClientConversation;
