import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../constants/enums';

export type NullableEventPayload<T> = {
  service: RemoteGitServices | null;
  eventType: string | null;
  eventPayload: T | null;
  instanceId: string | null;
};

export type EventPayload<T> = {
  service: RemoteGitServices;
  eventType: string;
  eventPayload: T;
  instanceId: string;
};

export type IssueChanges = {
  forAuthor?: boolean;
  forAssignee?: boolean;
  isNewAssignment?: boolean;
  isNewAssignmentWithDeadline?: {
    deadline: string;
  };
  isNewObject: boolean;
  isClosed?: boolean;
  isReopened?: boolean;
  isDescriptionChanged?: boolean;
  isTitleChanged?: boolean;
  isLabelsAdded?: {
    labels: string[];
  };
  isLabelsDeleted?: {
    labels: string[];
  };
  isLabelsAddedAndDeleted?: {
    addedLabels: string[];
    deletedLabels: string[];
  };
  isDueDateUpdated?: {
    due_date: string;
  };
  isDueDateAdded?: {
    due_date: string;
  };
  isDueDateDeleted?: boolean;
  haveChanges: boolean;
};

export type ChangesMap = {
  [ObjectTypes.ISSUE]: IssueChanges;
  [ObjectTypes.REQUEST]: 'not-implemented';
};

type ObjectTypeValues = (typeof ObjectTypes)[keyof typeof ObjectTypes];

export type EventChanges<T extends ObjectTypeValues> = {
  instanceUserId?: string;
  objectType: T;
  objectUrl: string;
  objectId: string;
  projectUrl: string;
  projectName: string;
  isCommon: boolean;
  changes: T extends keyof ChangesMap ? ChangesMap[T] : never;
};

export type NotificationMessage = {
  instanceUserId?: string;
  message: string;
};

export type DataForParsingChanges<T> = {
  eventMembersIds: number[];
} & Pick<EventPayload<T>, 'eventPayload'>;

export type ProjectEntity = {
  projectId: string;
  instanceId: string;
  name: string;
  projectUrl: string;
};

export type ObservableObjectEntity = {
  instanceId: string;
  objectId: string;
  projectId: string;
  objectType: string;
  objectUrl: string;
};

export type SubscriptionIdentifier = Omit<ObservableObjectEntity, 'objectUrl'> & {
  instanceUserId: string;
};

export interface DataParser<T> {
  readonly eventType: GitLabEventTypes;
  readonly gitProvider: RemoteGitServices;
  readonly objectType: ObjectTypes;
  parseObservableObjectInfo(eventPayload: EventPayload<T>): ObservableObjectEntity;
  parseProjectInfo(eventPayload: EventPayload<T>): ProjectEntity;
  parseEventMembersIds(eventPayload: EventPayload<T>): number[];
  parseEventInitiatorId(eventPayload: EventPayload<T>): string;
  parseEventChanges(data: DataForParsingChanges<T>): EventChanges<ObjectTypeValues>[];
}

export interface DataParserConstructor {
  new (): DataParser<any>;
}

export interface MessageComposer {
  readonly meantFor: ObjectTypes;
  composeMessage(changes: EventChanges<ObjectTypes>[]): NotificationMessage[];
}
