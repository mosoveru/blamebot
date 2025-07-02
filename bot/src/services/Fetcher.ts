import { ExternalGitSystemDataFetcher, GitApiHandler } from '@types';
import { GitProviders, PossibleCauses } from '@constants';

type RequiredInfo = {
  origin: string;
  provider: GitProviders;
  token: string;
};

export class Fetcher implements ExternalGitSystemDataFetcher {
  private gitApiHandlers: Map<GitProviders, GitApiHandler>;

  constructor(handlers: GitApiHandler[]) {
    this.gitApiHandlers = new Map();
    for (const handler of handlers) {
      this.gitApiHandlers.set(handler.meantFor, handler);
    }
  }

  async fetchUserData({ origin, provider, token }: RequiredInfo) {
    const apiHandler = this.gitApiHandlers.get(provider);
    if (!apiHandler) {
      return {
        ok: false as const,
        cause: PossibleCauses.NO_API_HANDLER_FOUND,
      };
    }
    return await apiHandler.requestUserData(origin, token);
  }
}
