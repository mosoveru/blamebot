import { Injectable } from '@nestjs/common';
import { DataParser, DataParserConstructor } from '../../types';
import { RemoteGitServices } from '../../constants/enums';

@Injectable()
export class DataParsersRepository {
  private readonly store: Map<string, DataParser<any>> = new Map();

  registerDataParsers(dataParsers: DataParserConstructor[]) {
    for (const DataParser of dataParsers) {
      const instantiatedDataParser = new DataParser();
      this.store.set(
        `${instantiatedDataParser.gitProvider}:${instantiatedDataParser.eventType}`,
        instantiatedDataParser,
      );
    }
  }

  getDataParser(gitProvider: RemoteGitServices, eventType: string) {
    return this.store.get(`${gitProvider}:${eventType}`);
  }
}
