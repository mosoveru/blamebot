import { DatabaseService } from '@types';
import { TypeORMError } from 'typeorm';
import { PossibleCauses } from '../constants/enums';
import { sign } from 'jsonwebtoken';
import { Context } from 'grammy';

type NewInstanceInfo<T extends string> = {
  instanceName: string;
  gitProvider: T;
  serviceBaseUrl: string;
};

type Success = {
  ok: true;
  jwt: string;
};

type Failed = {
  ok: false;
  cause: PossibleCauses;
};

type SaveInstanceResponse = Success | Failed;

export type InstanceManagerFlavor<C extends Context, T extends string> = C & {
  manager: InstanceManager<T>;
};

export class InstanceManager<T extends string> {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly secretKey: string,
  ) {}

  async saveNewInstance({
    instanceName,
    gitProvider,
    serviceBaseUrl,
  }: NewInstanceInfo<T>): Promise<SaveInstanceResponse> {
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
      if (error instanceof TypeORMError) {
        return {
          ok: false,
          cause: PossibleCauses.DATABASE_ERROR,
        };
      } else {
        return {
          ok: false,
          cause: PossibleCauses.UNKNOWN_ERROR,
        };
      }
    }
  }

  remindJwtToken(instanceId: string) {
    return sign(instanceId, this.secretKey);
  }
}
