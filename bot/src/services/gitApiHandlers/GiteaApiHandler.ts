import { GitApiHandler, GiteaUserApiResponse } from '@types';
import { GitProviders, PossibleCauses } from '@constants';

export class GiteaApiHandler implements GitApiHandler {
  readonly meantFor = GitProviders.GITEA;
  private giteaApiPathname = '/api/v1';
  private giteaUserApiPathname = '/user';

  async requestUserData(origin: string, token: string) {
    try {
      const response = await this.showCurrentUser({
        token,
        origin,
      });
      return {
        ok: true,
        instanceUserId: String(response.id),
        username: response.username,
        email: response.email,
        pathname: new URL(response.html_url).pathname,
      } as const;
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError && this.checkIsPossibleCause(err.cause)) {
        return this.generateFailedResponse(err.cause);
      }
      if (err instanceof TypeError && this.isFetchFailed(err.message)) {
        return this.generateFailedResponse(PossibleCauses.CONNECTION_ERROR);
      }
      return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
    }
  }

  private async showCurrentUser({ token, origin }: { token: string; origin: string }) {
    const bearer = this.makeBearerToken(token);
    const url = this.makeRequestUrl(origin);
    const res = await fetch(url, {
      headers: {
        authorization: bearer,
      },
    });
    if (res.ok) {
      return (await res.json()) as GiteaUserApiResponse;
    } else if (res.status === 404) {
      throw new TypeError('Unauthorized', {
        cause: PossibleCauses.CONNECTION_ERROR,
      });
    } else if (res.status === 403) {
      throw new TypeError('Unsufficient Scope', {
        cause: PossibleCauses.NOT_VALID_TOKEN_SCOPE,
      });
    } else if (res.status === 401) {
      throw new TypeError('Unauthorized', {
        cause: PossibleCauses.CANNOT_AUTHORIZE_CLIENT,
      });
    } else {
      throw new TypeError('Unknown Error', {
        cause: PossibleCauses.UNKNOWN_ERROR,
      });
    }
  }

  private makeRequestUrl(url: string): string {
    return new URL(this.giteaApiPathname + this.giteaUserApiPathname, url).toString();
  }

  private makeBearerToken(token: string) {
    return `Bearer ${token}`;
  }

  private generateFailedResponse(cause: PossibleCauses) {
    return {
      ok: false,
      cause,
    } as const;
  }

  private checkIsPossibleCause(cause: unknown): cause is PossibleCauses {
    return typeof cause === 'string' && !!PossibleCauses[cause as keyof typeof PossibleCauses];
  }

  private isFetchFailed(message: string): boolean {
    return message.includes('fetch failed');
  }
}
