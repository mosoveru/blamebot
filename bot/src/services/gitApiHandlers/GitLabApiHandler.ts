import { GitApiHandler } from '@types';
import { GitbeakerRequestError, Gitlab } from '@gitbeaker/rest';
import { GitProviders } from '@constants';
import { PossibleCauses } from '../../constants/enums';

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
      // TODO: Описать понятные ошибки на стандартные юз кейсы
      const possibleErrors = {
        insufficient_scope: PossibleCauses.NOT_VALID_TOKEN_SCOPE,
      };
      if (error instanceof GitbeakerRequestError && error.cause) {
        const key = error.cause.description as keyof typeof possibleErrors;
        const reason = possibleErrors[key];
        if (reason) {
          return this.generateFailedResponse(reason);
        } else {
          return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
        }
      } else {
        return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
      }
    }
  }

  private generateFailedResponse(cause: PossibleCauses) {
    return {
      ok: false,
      cause,
    } as const;
  }
}
