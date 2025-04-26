import { Module } from '@nestjs/common';
import { GitRemoteHandlersRepository } from '../repositories/git-remote-handlers-repository/git-remote-handlers-repository';
import { DataParsersRepository } from '../repositories/data-parsers-repository/data-parsers-repository.service';
import { DataParsers } from '../data-parsers';
import { NotificationComposers } from '../notification-composers';
import { NotificationComposersRepository } from '../repositories/notification-composers-repository/notification-composers-repository.service';

@Module({
  providers: [
    {
      provide: DataParsersRepository,
      useFactory: () => {
        const repository = new DataParsersRepository();
        for (const parsers of DataParsers) {
          repository.registerDataParsers(parsers);
        }
        return repository;
      },
    },
    {
      provide: NotificationComposersRepository,
      useFactory: () => {
        const repository = new NotificationComposersRepository();
        for (const composers of NotificationComposers) {
          repository.registerComposers(composers);
        }
        return repository;
      },
    },
  ],
  exports: [GitRemoteHandlersRepository],
})
export class RepositoryModule {}
