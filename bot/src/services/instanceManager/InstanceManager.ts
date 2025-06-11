import { DatabaseService, PgError } from '@types';
import { QueryFailedError } from 'typeorm';
import { PossibleCauses } from '@constants';
import { sign } from 'jsonwebtoken';
import { NewInstanceInfo, SaveInstanceResult } from './types';

export class InstanceManager {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly secretKey: string,
  ) {}

  async saveNewInstance({ instanceName, gitProvider, serviceBaseUrl }: NewInstanceInfo): Promise<SaveInstanceResult> {
    try {
      await this.dbService.saveInstance({
        instanceName,
        gitProvider,
        serviceBaseUrl,
      });
      const instance = await this.dbService.findInstanceInfoByUrl(serviceBaseUrl);
      if (!instance) {
        return {
          ok: false,
          cause: PossibleCauses.INSTANCE_NOT_FOUND,
        };
      }
      const jwt = this.remindJwtToken(instance.instanceId);
      return { ok: true, jwt };
    } catch (error) {
      // TODO: Переделать PgError под дженерик
      const isSameUrlError =
        error instanceof QueryFailedError && (error as QueryFailedError<PgError>).driverError.code === '23505';
      if (isSameUrlError) {
        return this.generateFailedResponse(PossibleCauses.INSTANCE_WITH_SAME_URL);
      } else {
        return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
      }
    }
  }

  remindJwtToken(instanceId: string) {
    return sign(instanceId, this.secretKey);
  }

  private generateFailedResponse(cause: PossibleCauses): SaveInstanceResult {
    return {
      ok: false,
      cause,
    };
  }
}
