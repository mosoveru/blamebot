import { GitLabEventTypes, ObjectTypes, GitProviders } from '../constants/enums';

export type NullableEventPayload<T> = {
  service: GitProviders | null;
  eventType: string | null;
  eventPayload: T | null;
  instanceId: string | null;
};

export type EventPayload<T> = {
  service: GitProviders;
  eventType: string;
  eventPayload: T;
  instanceId: string;
};

type UserInfo = {
  id: string;
  name: string;
};

export type IssueChanges = {
  forAuthor?: boolean;
  forAssignee?: boolean;
  isNewAssignment?: boolean;
  isUnassigned?: boolean;
  isAssigneesChanges?: {
    added?: UserInfo[];
    deleted?: UserInfo[];
  };
  isNewObject?: {
    isNewAssignment?: boolean;
    isNewAssignmentWithDeadline?: {
      deadline: string;
    };
  };
  isClosed?: boolean;
  isReopened?: boolean;
  isDescriptionChanged?: boolean;
  isTitleChanged?: boolean;
  isLabelsChanged?: {
    added?: string[];
    deleted?: string[];
  };
  isDueDateChanged?: {
    isUpdated?: {
      due_date: string;
    };
    isAdded?: {
      due_date: string;
    };
    isDeleted?: boolean;
  };
};

export type RequestChanges = {
  forAuthor?: boolean;
  forAssignee?: boolean;
  forReviewer?: boolean;
  isNewAssignment?: boolean;
  isUnassigned?: boolean;
  isNewReviewer?: boolean;
  isUnassignedReviewer?: boolean;
  isAssigneesChanges?: {
    added?: UserInfo[];
    deleted?: UserInfo[];
  };
  isReviewerChanges?: {
    added?: UserInfo[];
    deleted?: UserInfo[];
  };
  isNewObject?: {
    withAssignment?: boolean;
    withReviewer?: boolean;
  };
  isTitleChanged?: boolean;
  isDescriptionChanged?: boolean;
  isLabelsChanged?: {
    added?: string[];
    deleted?: string[];
  };
  isClosed?: boolean;
  isReopened?: boolean;
  isMerged?: {
    source_branch: string;
    target_branch: string;
  };
  isApproved?: {
    by: string;
  };
  isUnapproved?: {
    by: string;
  };
};

export type ChangesMap = {
  [ObjectTypes.ISSUE]: IssueChanges;
  [ObjectTypes.REQUEST]: RequestChanges;
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

export type SubscriptionInfo = Omit<ObservableObjectEntity, 'objectUrl'> & {
  uuid: string;
  instanceUserId: string;
};

export interface DataParser<T> {
  readonly eventType: GitLabEventTypes;
  readonly gitProvider: GitProviders;
  readonly objectType: ObjectTypes;
  parseObservableObjectInfo(eventPayload: EventPayload<T>): ObservableObjectEntity;
  parseProjectInfo(eventPayload: EventPayload<T>): ProjectEntity;
  parseEventMembersIds(eventPayload: EventPayload<T>): number[];
  parseEventInitiatorId(eventPayload: EventPayload<T>): string;
  parseEventChanges(data: DataForParsingChanges<T>): EventChanges<ObjectTypeValues>[];
}

export interface MessageComposer {
  readonly meantFor: ObjectTypes;
  composeMessage(changes: EventChanges<ObjectTypes>[]): NotificationMessage[];
}
