import { ApiResponse, ExternalGitSystemDataFetcher, GitApiHandler } from '@types';
import { GitProviders } from '@constants';
import { PossibleCauses } from '../constants/enums';

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
      console.log(error);
      return {
        ok: false,
        cause: PossibleCauses.EXTERNAL_SERVICE_FETCH_ERROR,
      } satisfies ApiResponse;
    }
  }
}
