import { GitApiHandler } from '@types';
import { Gitlab } from '@gitbeaker/rest';
import { GitProviders } from '@constants';

export class GitLabApiHandler implements GitApiHandler {
  readonly meantFor = GitProviders.GITLAB;

  async requestUserData(origin: string, token: string) {
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
  }
}
