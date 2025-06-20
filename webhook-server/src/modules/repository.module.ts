import { Module } from '@nestjs/common';
import { DataParsersRepository } from '../data-parsers/data-parsers.repository';
import { DataParsers } from '../data-parsers';
import { ChangesAnalyserService } from '../services/changes-analyser.service';
import { performBinarySearchInLists } from '../utils';

@Module({
  providers: [
    {
      provide: DataParsersRepository,
      useFactory: () => {
        const repository = new DataParsersRepository();
        for (const parsers of DataParsers) {
          repository.registerDataParsers(parsers, performBinarySearchInLists);
        }
        return repository;
      },
    },
    ChangesAnalyserService,
  ],
  exports: [DataParsersRepository, ChangesAnalyserService],
})
export class RepositoryModule {}
