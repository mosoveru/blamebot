import { DataForParsingChanges, DataParser, EventChanges, EventPayload, RequestChanges } from '../../types';
import { GitLabMergeRequestEvent, Label, User } from '../../types/gitlab';
import { GitLabEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';
import { BinarySearcher } from '../types';

type ChangesForRequest = EventChanges<ObjectTypes.REQUEST>;
type PossibleChanges =
  | 'title'
  | 'description'
  | 'assignees'
  | 'reviewers'
  | 'state_id'
  | 'labels'
  | 'approve'
  | 'unapproved';
type ChangesParser = () => void;

export class MergeRequestHookDataParser implements DataParser<GitLabMergeRequestEvent> {
  readonly eventType = GitLabEventTypes.MERGE_REQUEST;
  readonly gitProvider = GitProviders.GITLAB;
  readonly objectType = ObjectTypes.REQUEST as const;

  private _requestChanges: RequestChanges | null;
  private _eventPayload: GitLabMergeRequestEvent | null;
  private requestChangesParsers: Record<PossibleChanges, ChangesParser> = {
    title: this.parseRequestHeaderChanges.bind(this),
    description: this.parseRequestHeaderChanges.bind(this),
    assignees: this.parseChangesForUsers.bind(this, 'assignees'),
    reviewers: this.parseChangesForUsers.bind(this, 'reviewers'),
    state_id: this.parseRequestStatus.bind(this),
    labels: this.parseChangesForLabels.bind(this),
    approve: this.isApproved.bind(this),
    unapproved: this.isUnapproved.bind(this),
  };

  constructor(searcher: BinarySearcher) {
    this.performBinarySearchInLists = searcher;
  }

  parseProjectInfo(eventPayload: EventPayload<GitLabMergeRequestEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabMergeRequestEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      objectId: String(eventPayload.eventPayload.object_attributes.id),
      projectId: String(eventPayload.eventPayload.project.id),
      objectType: ObjectTypes.REQUEST,
      objectUrl: eventPayload.eventPayload.object_attributes.url,
    };
  }

  parseEventMembersIds(serviceType: EventPayload<GitLabMergeRequestEvent>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    objectMembersIdsSet.add(serviceType.eventPayload.object_attributes.author_id);
    serviceType.eventPayload.object_attributes.assignee_ids.forEach((assigneeId) =>
      objectMembersIdsSet.add(assigneeId),
    );
    serviceType.eventPayload.object_attributes.reviewer_ids.forEach((reviewerId) =>
      objectMembersIdsSet.add(reviewerId),
    );
    if (serviceType.eventPayload.changes.assignees?.previous) {
      const previousAssignees = serviceType.eventPayload.changes.assignees?.previous;
      for (const assignee of previousAssignees) {
        objectMembersIdsSet.add(assignee.id);
      }
    }
    if (serviceType.eventPayload.changes.reviewers?.previous) {
      const previousReviewers = serviceType.eventPayload.changes.reviewers.previous;
      for (const reviewer of previousReviewers) {
        objectMembersIdsSet.add(reviewer.id);
      }
    }
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabMergeRequestEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({
    eventMembersIds,
    eventPayload,
  }: DataForParsingChanges<GitLabMergeRequestEvent>): ChangesForRequest[] {
    this.eventPayload = eventPayload;
    const changes = this.parseChanges();
    if (!changes) {
      return [];
    }
    const eventChangesTemplate = {
      objectType: this.objectType,
      objectUrl: eventPayload.object_attributes.url,
      objectId: String(eventPayload.object_attributes.id),
      projectUrl: eventPayload.project.web_url,
      projectName: eventPayload.project.name,
    };
    const commonChanges = {
      ...eventChangesTemplate,
      changes: {
        ...changes,
      },
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<ChangesForRequest[]>((acc, memberId) => {
      const formIndividualChanges = (particularChanges: Partial<RequestChanges>) => {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...changes,
            ...particularChanges,
          },
        });
      };
      if (this.isAssignee(memberId)) {
        formIndividualChanges({
          isNewAssignment: this.checkIsNewAssignment(String(memberId)),
          forAssignee: true,
        });
        if (this.checkIsDeletedAssignment(String(memberId))) {
          formIndividualChanges({
            isUnassigned: true,
            forAssignee: true,
          });
        }
        return acc;
      }
      if (this.isReviewer(memberId)) {
        formIndividualChanges({
          isNewReviewer: this.checkIsNewAssignment(String(memberId)),
          forReviewer: true,
        });
        if (this.checkIsDeletedAssignment(String(memberId))) {
          formIndividualChanges({
            isUnassigned: true,
            forReviewer: true,
          });
        }
        return acc;
      }
      if (this.isAuthor(memberId)) {
        formIndividualChanges({
          forAuthor: true,
        });
        return acc;
      }
      return acc;
    }, []);
    this.resetContext();
    return [...individualChanges, commonChanges];
  }

  private parseChanges() {
    this.requestChanges = {};
    const eventPayload = this.eventPayload;
    if (this.isNewObject()) {
      return this.requestChanges;
    }
    const action = eventPayload.object_attributes.action;
    if (this.requestChangesParsers[action]) {
      this.requestChangesParsers[action]();
    }
    const keys = Object.keys(eventPayload.changes);
    for (const key of keys) {
      if (this.requestChangesParsers[key]) {
        this.requestChangesParsers[key]();
      }
    }
    const isThereNoChangesInEventPayload = !Object.keys(this.requestChanges).length;
    if (isThereNoChangesInEventPayload) {
      return null;
    }
    return this.requestChanges;
  }

  private isAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.assignees?.some((a) => a.id === assigneeId);
  }

  private isAuthor(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.object_attributes.author_id === memberId;
  }

  private isReviewer(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.reviewers?.some((a) => a.id === memberId);
  }

  private checkIsNewAssignment(id: string) {
    const changes = this.requestChanges;
    if (changes.isAssigneesChanges?.added) {
      return changes.isAssigneesChanges.added.some((assignee) => assignee.id === id);
    }
    if (changes.isReviewerChanges?.added) {
      return changes.isReviewerChanges.added.some((assignee) => assignee.id === id);
    }
  }

  private checkIsDeletedAssignment(id: string) {
    const changes = this.requestChanges;
    if (changes.isAssigneesChanges?.deleted) {
      return changes.isAssigneesChanges.deleted.some((assignee) => assignee.id === id);
    }
    if (changes.isReviewerChanges?.deleted) {
      return changes.isReviewerChanges.deleted.some((assignee) => assignee.id === id);
    }
  }

  private isNewObject() {
    const eventPayload = this.eventPayload;
    const requestChanges = this.requestChanges;
    if (eventPayload.object_attributes.action === 'open') {
      requestChanges.isNewObject = {};
      if (eventPayload.assignees.length) {
        requestChanges.isNewObject.withAssignment = true;
      }
      if (eventPayload.reviewers.length) {
        requestChanges.isNewObject.withReviewer = true;
      }
      return true;
    }
    return false;
  }

  private parseRequestStatus() {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    if (eventPayload.object_attributes.action === 'close') {
      changes.isClosed = true;
      return;
    }
    if (eventPayload.object_attributes.action === 'reopen') {
      changes.isReopened = true;
    }
    if (eventPayload.object_attributes.action === 'merge') {
      changes.isMerged = {
        source_branch: eventPayload.object_attributes.source_branch,
        target_branch: eventPayload.object_attributes.target_branch,
      };
    }
  }

  private isApproved() {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    if (eventPayload.object_attributes.action === 'approve') {
      changes.isApproved = {
        by: eventPayload.user.name,
      };
    }
  }

  private isUnapproved() {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    if (eventPayload.object_attributes.action === 'unapproved') {
      changes.isUnapproved = {
        by: eventPayload.user.name,
      };
    }
  }

  private parseRequestHeaderChanges() {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
    }
    if (eventPayload.changes.description) {
      changes.isDescriptionChanged = true;
    }
  }

  private parseChangesForUsers(meantFor: 'assignees' | 'reviewers') {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    let currentUsers: User[];
    let previousUsers: User[];
    if (meantFor === 'assignees') {
      currentUsers = [...eventPayload.changes.assignees!.current];
      previousUsers = [...eventPayload.changes.assignees!.previous];
    } else {
      currentUsers = [...eventPayload.changes.reviewers!.current];
      previousUsers = [...eventPayload.changes.reviewers!.previous];
    }
    const userChanges = this.performBinarySearchInLists(currentUsers, previousUsers);
    const reduceAssignees = (assignee: User) => ({
      id: String(assignee.id),
      name: assignee.name,
    });
    const readyChanges = {
      added: userChanges.added?.map(reduceAssignees),
      deleted: userChanges.deleted?.map(reduceAssignees),
    };
    if (meantFor === 'assignees') {
      changes.isAssigneesChanges = readyChanges;
    }
    if (meantFor === 'reviewers') {
      changes.isReviewerChanges = readyChanges;
    }
  }

  private parseChangesForLabels() {
    const eventPayload = this.eventPayload;
    const changes = this.requestChanges;
    const currentLabels = [...eventPayload.changes.labels!.current];
    const previousLabels = [...eventPayload.changes.labels!.previous];
    const parsedChanges = this.performBinarySearchInLists<Label>(currentLabels, previousLabels);
    const reduceLabels = (label: Label) => label.title;
    changes.isLabelsChanged = {
      added: parsedChanges.added?.map(reduceLabels),
      deleted: parsedChanges.deleted?.map(reduceLabels),
    };
  }

  private performBinarySearchInLists: BinarySearcher;

  private get eventPayload() {
    if (this._eventPayload === null) {
      throw new TypeError(
        'Event Payload was not provided within Issue Hook Data Parser class. Did you forget to set the event payload value?',
      );
    }
    return this._eventPayload;
  }

  private get requestChanges() {
    if (this._requestChanges === null) {
      throw new TypeError(
        'Request Changes object was not set within Merge Request Hook Data Parser class. Did you forget to set the initial object to the property Request Changes?',
      );
    }
    return this._requestChanges;
  }

  private set eventPayload(payload: GitLabMergeRequestEvent) {
    this._eventPayload = payload;
  }

  private set requestChanges(changes: RequestChanges) {
    this._requestChanges = changes;
  }

  private resetContext() {
    this._eventPayload = null;
    this._requestChanges = null;
  }
}
