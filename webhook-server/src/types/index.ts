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
export type TObservableObjectInfo = {
  objectId: number;
  projectId: number;
  objectType: string;
};

export type TObservableObject = {
  objectId: number;
  projectId: number;
  objectType: string;
  serviceId: string;
};

export type PendingSubscription = TObservableObject & {
  serviceUserId: number;
};

export interface GitRemoteHandler<T> {
  readonly eventType: string;
  parseEventMembersIds(serviceType: ServiceType<T>): number[];
  parseObservableObjectInfo(serviceType: ServiceType<T>): TObservableObjectInfo;
  composeNotification(serviceType: ServiceType<T>): string;
}

export interface GitRemoteHandlerConstructor {
  new (): GitRemoteHandler<any>;
}
