import { Injectable } from '@nestjs/common';
import { GitRemoteHandler, GitRemoteHandlerConstructor } from '../../types';
import { RemoteGitServices } from '../../constants/enums';

@Injectable()
export class GitRemoteHandlersRepository {
  private store: Map<string, GitRemoteHandler<any>> = new Map();

  registerHandlers(serviceName: RemoteGitServices, handlers: GitRemoteHandlerConstructor[]) {
    for (const handler of handlers) {
      const instantiatedHandler = new handler();
      this.store.set(`${serviceName}:${instantiatedHandler.eventType}`, instantiatedHandler);
    }
  }

  getGitRemoteHandler(serviceType: RemoteGitServices, eventType: string) {
    return this.store.get(`${serviceType}:${eventType}`);
  }
}
