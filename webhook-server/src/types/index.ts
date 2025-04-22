import { RemoteGitServices } from '../constants/enums';

export type WebhookEventPayload<T> = {
  service: RemoteGitServices;
  eventType: string;
  eventPayload: T;
} | null;

export type WebhookServiceName = {
  name: string;
} | null;

export type EventPayload<T> = Exclude<WebhookEventPayload<T>, null>;
export type ServiceName = Exclude<WebhookServiceName, null>;
export type EventInfo<T> = EventPayload<T> & ServiceName;

export type TObjectFromPayload = {
  objectId: string;
  projectId: string;
  objectType: string;
  objectUrl: string;
};

export type TObservableObjectEntity = TObjectFromPayload & {
  serviceId: string;
};

export type TSubscriptionIdentifier = Omit<TObservableObjectEntity, 'objectUrl'> & {
  serviceUserId: string;
};

export interface GitRemoteHandler<T> {
  readonly eventType: string;
  parseEventMembersIds(serviceType: EventPayload<T>): number[];
  parseObservableObjectInfo(serviceType: EventPayload<T>): TObjectFromPayload;
  parseEventInitiatorId(serviceType: EventPayload<T>): string;
  composeNotification(serviceType: EventInfo<T>): string;
}

export interface GitRemoteHandlerConstructor {
  new (): GitRemoteHandler<any>;
}
