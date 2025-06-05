import { NextFunction } from 'grammy';
import { BlamebotContext, ExternalGitSystemDataFetcher } from '@types';

export function provideFetcher(fetcher: ExternalGitSystemDataFetcher) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.fetcher = fetcher;
    await next();
  };
}
