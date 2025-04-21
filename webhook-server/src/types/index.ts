import { RemoteGitServices } from '../constants/enums';

export type GitWebhookServiceType<T> = {
  service: RemoteGitServices;
  eventType: string;
  eventPayload: T;
} | null;

export type GitWebhookServiceName = {
  name: string;
} | null;

export type ServiceType<T> = Exclude<GitWebhookServiceType<T>, null>;
export type ServiceName = Exclude<GitWebhookServiceName, null>;
export type EventInfo<T> = ServiceType<T> &
  ServiceName & {
    eventMemberIds: number[];
  };

export type TObservableObjectInfoFromPayload = {
  objectId: string;
  projectId: string;
  objectType: string;
  objectUrl: string;
};

export type TObservableObjectEntity = TObservableObjectInfoFromPayload & {
  serviceId: string;
};

export type PendingSubscription = Omit<TObservableObjectEntity, 'objectUrl'> & {
  serviceUserId: string;
};

export interface GitRemoteHandler<T> {
  readonly eventType: string;
  parseEventMembersIds(serviceType: ServiceType<T>): number[];
  parseObservableObjectInfo(serviceType: ServiceType<T>): TObservableObjectInfoFromPayload;
  composeNotification(serviceType: ServiceType<T>): string;
}

export interface GitRemoteHandlerConstructor {
  new (): GitRemoteHandler<any>;
}
