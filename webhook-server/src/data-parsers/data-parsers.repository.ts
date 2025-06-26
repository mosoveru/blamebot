import { Injectable } from '@nestjs/common';
import { DataParser } from '../types';
import { GitProviders } from '../constants/enums';
import { BinarySearcher, DataParserConstructor } from './types';

@Injectable()
export class DataParsersRepository {
  private readonly store: Map<string, DataParser<any>> = new Map();

  registerDataParsers(dataParsers: DataParserConstructor[], searcher: BinarySearcher) {
    for (const DataParser of dataParsers) {
      const instantiatedDataParser = new DataParser(searcher);
      if (instantiatedDataParser.eventType?.length) {
        for (const eventType of instantiatedDataParser.eventType) {
          this.store.set(`${instantiatedDataParser.gitProvider}:${eventType}`, instantiatedDataParser);
        }
      } else {
        this.store.set(
          `${instantiatedDataParser.gitProvider}:${instantiatedDataParser.eventType}`,
          instantiatedDataParser,
        );
      }
    }
  }

  getDataParser(gitProvider: GitProviders, eventType: string) {
    return this.store.get(`${gitProvider}:${eventType}`);
  }
}
