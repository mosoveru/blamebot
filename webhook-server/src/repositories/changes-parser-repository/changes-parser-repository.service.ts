import { Injectable } from '@nestjs/common';
import { ChangesParser, ChangesParserConstructor } from '../../types';
import { RemoteGitServices } from '../../constants/enums';

@Injectable()
export class ChangesParserRepository {
  private readonly store: Map<string, ChangesParser<any>> = new Map();

  registerChangesParsers(changesParsers: ChangesParserConstructor[]) {
    for (const ChangesParser of changesParsers) {
      const changesParserInstance = new ChangesParser();
      this.store.set(`${changesParserInstance.gitProvider}:${changesParserInstance.eventType}`, changesParserInstance);
    }
  }

  getChangesParser(gitProvider: RemoteGitServices, eventType: string) {
    return this.store.get(`${gitProvider}:${eventType}`);
  }
}
