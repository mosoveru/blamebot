import { GitApiHandler, GiteaUserApiResponse } from '@types';
import { GitProviders, PossibleCauses } from '@constants';
import fetch from 'node-fetch';

export class GiteaApiHandler implements GitApiHandler {
  readonly meantFor = GitProviders.GITEA;
  private giteaApiPathname = '/api/v1';
  private giteaUserApiPathname = '/user';

  async requestUserData(origin: string, token: string) {
    // TODO: добавить человеческую обработку ошибок
    try {
      const response = await this.showCurrentUser({
        token,
        origin,
      });
      console.log(response);
      return {
        ok: true,
        instanceUserId: String(response.id),
        username: response.username,
        email: response.email,
        pathname: new URL(response.html_url).pathname,
      } as const;
    } catch (err) {
      return {
        ok: false,
        cause: PossibleCauses.UNKNOWN_ERROR,
      } as const;
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
    if (!res.ok) {
      throw new TypeError('Unknown Error', {
        cause: 'Unknown',
      });
    } else {
      return (await res.json()) as GiteaUserApiResponse;
    }
  }

  private makeRequestUrl(url: string): string {
    return new URL(this.giteaApiPathname + this.giteaUserApiPathname, url).toString();
  }

  private makeBearerToken(token: string) {
    return `Bearer ${token}`;
  }
}
