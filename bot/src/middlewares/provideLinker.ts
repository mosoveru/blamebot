import { NextFunction } from 'grammy';
import { BlamebotContext, LinkingService } from '@types';

export function provideLinker(linker: LinkingService) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.linker = linker;
    await next();
  };
}
