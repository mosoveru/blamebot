import { NextFunction } from 'grammy';
import { BlamebotContext } from '@types';
import { InstanceManager } from '@services';
import { GitProviders } from '@constants';

export function provideInstanceManager(manager: InstanceManager<GitProviders>) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.manager = manager;
    await next();
  };
}
