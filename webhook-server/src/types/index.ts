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

export type EventChanges = {
  serviceUserId?: string;
  changes: string[];
};

export type NotificationMessage = {
  serviceUserId?: string;
  message: string;
};

export type ParseChangesData<T> = {
  eventMembersIds: number[];
} & Pick<EventPayload<T>, 'eventPayload'>;

export type ObservableObjectEntity = {
  serviceId: string;
  objectId: string;
  projectId: string;
  objectType: string;
  objectUrl: string;
};

export type SubscriptionIdentifier = Omit<ObservableObjectEntity, 'objectUrl'> & {
  serviceUserId: string;
};

export interface DataParser<T> {
  readonly eventType: GitLabEventTypes;
  readonly gitProvider: RemoteGitServices;
  parseEventMembersIds(serviceType: EventPayload<T>): number[];
  parseObservableObjectInfo(serviceType: EventPayload<T>): ObservableObjectEntity;
  parseEventInitiatorId(serviceType: EventPayload<T>): string;
  parseEventChanges(data: ParseChangesData<T>): EventChanges[];
}

export interface DataParserConstructor {
  new (): DataParser<any>;
}
