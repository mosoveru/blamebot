import { IncomingHttpHeaders } from 'http';

export interface GitServiceTypeParser {
  parseGitServiceAndEventType(headers: IncomingHttpHeaders): GitServiceAndEventType | null;
}

type GitServiceAndEventType = {
  service: string;
  eventType: string;
};
