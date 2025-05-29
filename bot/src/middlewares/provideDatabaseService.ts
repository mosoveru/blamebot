import { BlamebotContext, DatabaseService } from '../types';
import { NextFunction } from 'grammy';

function provideDatabaseService(databaseService: DatabaseService) {
  return async (ctx: BlamebotContext, next: NextFunction) => {
    ctx.dbService = databaseService;
    await next();
  };
}

export default provideDatabaseService;
