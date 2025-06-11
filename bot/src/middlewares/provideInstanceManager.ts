import { NextFunction } from 'grammy';
import { BlamebotContext } from '@types';
import { InstanceManager } from '@services';

export function provideInstanceManager(manager: InstanceManager) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.manager = manager;
    await next();
  };
}
