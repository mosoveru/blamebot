import { Injectable } from '@nestjs/common';
import { GitServiceTypeParser } from '../../types';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class GitServiceTypeParserService implements GitServiceTypeParser {
  private GIT_SERVICE_HEADERS = new Map([
    ['x-gitlab-event', 'GITLAB'],
    ['x-gitea-event', 'GITEA'],
  ]);

  parseGitServiceAndEventType(headers: IncomingHttpHeaders) {
    for (const gitServiceEvent of this.GIT_SERVICE_HEADERS.keys()) {
      if (headers[gitServiceEvent]) {
        return {
          service: this.GIT_SERVICE_HEADERS.get(gitServiceEvent),
          eventType: headers[gitServiceEvent] as string,
        };
      }
    }
    return null;
  }
}
