import { ApiResponse, ExternalGitSystemDataFetcher, GitApiHandler } from '@types';
import { GitProviders } from '@constants';

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
    const apiHandler = this.gitApiHandlers.get(provider)!;
    try {
      return await apiHandler.requestUserData(origin, token);
    } catch (error) {
      return {
        ok: false,
        cause: 'Bad Request',
        message: (error as Error).message,
      } satisfies ApiResponse;
    }
  }
}
