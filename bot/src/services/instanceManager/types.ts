import { GitProviders, PossibleCauses } from '@constants';
import { Context } from 'grammy';
import { InstanceManager } from '@services';

export type NewInstanceInfo = {
  instanceName: string;
  gitProvider: GitProviders;
  serviceBaseUrl: string;
};

export type Success = {
  ok: true;
  jwt: string;
};

export type Failed = {
  ok: false;
  cause: PossibleCauses;
};

export type SaveInstanceResult = Success | Failed;

export type InstanceManagerFlavor<C extends Context> = C & {
  manager: InstanceManager;
};
