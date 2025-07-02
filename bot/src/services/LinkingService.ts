import { DatabaseService, LinkClientRequiredData, LinkingService, LinkingServiceResponse, PgError } from '@types';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { PossibleCauses } from '@constants';

export class Linker implements LinkingService {
  constructor(private readonly dbService: DatabaseService) {}

  async linkClient(data: LinkClientRequiredData) {
    try {
      if (!data.telegramUserId) {
        return this.generateFailedResponse(PossibleCauses.TELEGRAM_INFO_NOT_EXISTS);
      }
      const instance = await this.dbService.findInstanceInfoByUrl(data.instanceUrl);
      if (!instance) {
        return this.generateFailedResponse(PossibleCauses.INSTANCE_NOT_FOUND);
      }
      await this.dbService.saveTgUser({
        telegramUserId: data.telegramUserId,
        username: data.telegramUsername,
        name: data.telegramName,
      });
      await this.dbService.saveInstanceUser({
        instanceId: instance.instanceId,
        instanceUserId: data.instanceUserId,
        telegramUserId: data.telegramUserId,
        username: data.instanceUsername,
        email: data.email,
        pathname: data.pathname,
      });
      return this.generateSuccessResponse();
    } catch (error) {
      if (error instanceof QueryFailedError && (error as QueryFailedError<PgError>).driverError.code === '23505') {
        return this.generateFailedResponse(PossibleCauses.INSTANCE_USER_ALREADY_EXISTS);
      }
      if (error instanceof TypeORMError) {
        return this.generateFailedResponse(PossibleCauses.DATABASE_ERROR);
      }
      return this.generateFailedResponse(PossibleCauses.UNKNOWN_ERROR);
    }
  }

  private generateSuccessResponse(): LinkingServiceResponse {
    return {
      ok: true,
    };
  }

  private generateFailedResponse(cause: PossibleCauses): LinkingServiceResponse {
    return {
      ok: false,
      cause,
    };
  }
}
