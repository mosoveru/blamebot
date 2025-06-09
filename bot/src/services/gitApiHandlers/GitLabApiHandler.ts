import { GitApiHandler } from '@types';
import { GitbeakerRequestError, Gitlab } from '@gitbeaker/rest';
import { GitProviders } from '@constants';
import { PossibleCauses } from '../../constants/enums';

interface ErrorWithCode extends Error {
  code: string;
}

export class GitLabApiHandler implements GitApiHandler {
  readonly meantFor = GitProviders.GITLAB;

  async requestUserData(origin: string, token: string) {
    try {
      const api = new Gitlab({
        token,
        host: origin,
      });
      const response = await api.Users.showCurrentUser();
      return {
        ok: true,
        instanceUserId: String(response.id),
        username: response.username,
        email: response.email,
        pathname: new URL(response.web_url).pathname,
      } as const;
    } catch (error) {
      if (this.isUnsufficientScope(error)) {
        return this.generateFailedResponse(PossibleCauses.NOT_VALID_TOKEN_SCOPE);
      }
      if (this.isUnauthorizedError(error)) {
        return this.generateFailedResponse(PossibleCauses.CANNOT_AUTHORIZE_CLIENT);
      }
      if (this.isConnectionError(error)) {
        return this.generateFailedResponse(PossibleCauses.CONNECTION_ERROR);
      }
      return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
    }
  }

  private generateFailedResponse(cause: PossibleCauses) {
    return {
      ok: false,
      cause,
    } as const;
  }

  private isConnectionError(error: unknown): boolean {
    if (error instanceof TypeError && error.cause instanceof Error) {
      return (error.cause as ErrorWithCode).code === 'ECONNREFUSED';
    }
    return false;
  }

  private isUnsufficientScope(error: unknown) {
    if (error instanceof GitbeakerRequestError && error.cause) {
      const description = error.cause.description as string;
      if (description === 'insufficient_scope') {
        return true;
      }
    }
    return false;
  }

  private isUnauthorizedError(error: unknown) {
    if (error instanceof GitbeakerRequestError && error.cause) {
      const description = error.cause.description as string;
      if (description === '401 Unauthorized') {
        return true;
      }
    }
    return false;
  }
}
