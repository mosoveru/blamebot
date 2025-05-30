import { NextFunction } from 'grammy';
import { BlamebotContext, DatabaseService } from '@types';

function provideDatabaseService(databaseService: DatabaseService) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.dbService = databaseService;
    await next();
  };
}

export default provideDatabaseService;
