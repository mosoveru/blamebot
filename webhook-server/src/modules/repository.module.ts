import { Module } from '@nestjs/common';
import { DataParsersRepository } from '../repositories/data-parsers-repository/data-parsers-repository.service';
import { DataParsers } from '../data-parsers';
import { ChangesParserRepository } from '../repositories/changes-parser-repository/changes-parser-repository.service';
import { ChangesParsers } from '../changes-parsers';

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
      provide: ChangesParserRepository,
      useFactory: () => {
        const repository = new ChangesParserRepository();
        for (const composers of ChangesParsers) {
          repository.registerChangesParsers(composers);
        }
        return repository;
      },
    },
  ],
  exports: [DataParsersRepository, ChangesParserRepository],
})
export class RepositoryModule {}
