import { GitLabEventTypes, RemoteGitServices } from '../constants/enums';

export type NullableEventPayload<T> = {
  service: RemoteGitServices | null;
  eventType: string | null;
  eventPayload: T | null;
  name: string | null;
};

export type EventPayload<T> = {
  service: RemoteGitServices;
  eventType: string;
  eventPayload: T;
  name: string;
};

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

export interface NotificationComposer<T> {
  readonly eventType: GitLabEventTypes;
  readonly gitProvider: RemoteGitServices;
  composeNotification(serviceType: EventInfo<T>): string;
}

export interface DataParser<T> {
  readonly eventType: GitLabEventTypes;
  readonly gitProvider: RemoteGitServices;
  parseEventMembersIds(serviceType: EventPayload<T>): number[];
  parseObservableObjectInfo(serviceType: EventPayload<T>): TObjectFromPayload;
  parseEventInitiatorId(serviceType: EventPayload<T>): string;
}

export interface NotificationComposerConstructor {
  new (): NotificationComposer<any>;
}

export interface DataParserConstructor {
  new (): DataParser<any>;
}

export interface GitRemoteHandlerConstructor {
  new (): GitRemoteHandler<any>;
}
