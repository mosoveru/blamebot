import { Module } from '@nestjs/common';
import { DataParsersRepository } from '../repositories/data-parsers-repository/data-parsers.repository';
import { DataParsers } from '../data-parsers';
import { ChangesAnalyserService } from '../services/changes-analyser/changes-analyser.service';

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
    ChangesAnalyserService,
  ],
  exports: [DataParsersRepository, ChangesAnalyserService],
})
export class RepositoryModule {}
