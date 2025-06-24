import { GitLabEmojiEvent } from '../../types/gitlab/emoji-event';
import {
  DataForParsingChanges,
  DataParser,
  EventChanges,
  EventPayload,
  IssueChanges,
  RequestChanges,
} from '../../types';
import { GitLabEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';

type ChangesForRequestOrIssue = EventChanges<ObjectTypes.ISSUE | ObjectTypes.REQUEST>;

export class EmojiHookDataParser implements DataParser<GitLabEmojiEvent> {
  readonly eventType = GitLabEventTypes.EMOJI;
  readonly gitProvider = GitProviders.GITLAB;
  readonly objectType = ObjectTypes.ISSUE;

  private _requestChanges: RequestChanges | null;
  private _issueChanges: IssueChanges | null;
  private _eventPayload: GitLabEmojiEvent | null;

  parseProjectInfo(eventPayload: EventPayload<GitLabEmojiEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabEmojiEvent>) {
    if (eventPayload.eventPayload.merge_request) {
      return {
        instanceId: eventPayload.instanceId,
        objectId: String(eventPayload.eventPayload.merge_request.id),
        projectId: String(eventPayload.eventPayload.project.id),
        objectType: ObjectTypes.REQUEST,
        objectUrl: eventPayload.eventPayload.merge_request.url,
      };
    } else {
      return {
        instanceId: eventPayload.instanceId,
        objectId: String(eventPayload.eventPayload.issue!.id),
        projectId: String(eventPayload.eventPayload.project.id),
        objectType: ObjectTypes.ISSUE,
        objectUrl: eventPayload.eventPayload.issue!.url,
      };
    }
  }

  parseEventMembersIds(serviceType: EventPayload<GitLabEmojiEvent>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    if (serviceType.eventPayload.merge_request) {
      objectMembersIdsSet.add(serviceType.eventPayload.merge_request.author_id);
      serviceType.eventPayload.merge_request.assignee_ids.forEach((assigneeId) => objectMembersIdsSet.add(assigneeId));
      serviceType.eventPayload.merge_request.reviewer_ids.forEach((reviewerId) => objectMembersIdsSet.add(reviewerId));
    }
    if (serviceType.eventPayload.issue) {
      objectMembersIdsSet.add(serviceType.eventPayload.issue.author_id);
      serviceType.eventPayload.issue.assignee_ids.forEach((assigneeId) => objectMembersIdsSet.add(assigneeId));
    }
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabEmojiEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({ eventMembersIds, eventPayload }: DataForParsingChanges<GitLabEmojiEvent>) {
    if (eventPayload.merge_request) {
      this.eventPayload = eventPayload;
      this.requestChanges = {};
      return this.findChangesInMergeRequest(eventMembersIds);
    } else {
      this.eventPayload = eventPayload;
      this.issueChanges = {};
      return this.findChangesInIssue(eventMembersIds);
    }
  }

  private findChangesInIssue(eventMembersIds: number[]) {
    const eventPayload = this.eventPayload;
    const changes = this.parseChanges<'issue'>('issue');
    if (!this.checkIsThereAnyChanges('issue')) {
      return [];
    }
    const eventChangesTemplate = {
      objectType: ObjectTypes.ISSUE as const,
      objectUrl: eventPayload.issue!.url,
      objectId: String(eventPayload.issue!.id),
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
    const individualChanges = eventMembersIds.reduce<ChangesForRequestOrIssue[]>((acc, memberId) => {
      const formIndividualChanges = (particularChanges: Partial<IssueChanges>) => {
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
      if (this.isIssueAssignee(memberId)) {
        formIndividualChanges({
          forAssignee: true,
        });
        return acc;
      }
      if (this.isIssueAuthor(memberId)) {
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

  private findChangesInMergeRequest(eventMembersIds: number[]) {
    const eventPayload = this.eventPayload;
    const changes = this.parseChanges<'request'>('request');
    if (!this.checkIsThereAnyChanges('request')) {
      return [];
    }
    const eventChangesTemplate = {
      objectType: ObjectTypes.REQUEST as const,
      objectUrl: eventPayload.merge_request!.url,
      objectId: String(eventPayload.merge_request!.id),
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
    const individualChanges = eventMembersIds.reduce<ChangesForRequestOrIssue[]>((acc, memberId) => {
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
      if (this.isRequestAssignee(memberId)) {
        formIndividualChanges({
          forAssignee: true,
        });
        return acc;
      }
      if (this.isRequestReviewer(memberId)) {
        formIndividualChanges({
          forReviewer: true,
        });
        return acc;
      }
      if (this.isRequestAuthor(memberId)) {
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

  private parseChanges<T extends 'request' | 'issue'>(
    meantFor: T,
  ): T extends 'request' ? RequestChanges : IssueChanges {
    const eventPayload = this.eventPayload;
    let changes: IssueChanges | RequestChanges;
    if (meantFor === 'request') {
      changes = this.requestChanges;
    } else {
      changes = this.issueChanges;
    }
    const generateEmojiChanges = (objAttr: GitLabEmojiEvent['object_attributes']) => {
      if (objAttr.name === 'thumbsup') {
        return {
          isEmojiThumbUp: true,
        };
      } else if (objAttr.name === 'thumbsdown') {
        return {
          isEmojiThumbDown: true,
        };
      } else if (objAttr.name === 'clown') {
        return {
          isEmojiClown: true,
        };
      } else {
        return {
          isOther: true,
        };
      }
    };
    if (eventPayload.event_type === 'award') {
      changes.isEmojiChanged = {
        isAdded: generateEmojiChanges(eventPayload.object_attributes),
      };
      return changes as ReturnType<typeof this.parseChanges<T>>;
    } else {
      changes.isEmojiChanged = {
        isDeleted: generateEmojiChanges(eventPayload.object_attributes),
      };
      return changes as ReturnType<typeof this.parseChanges<T>>;
    }
  }

  private checkIsThereAnyChanges(where: 'request' | 'issue') {
    if (where === 'request') {
      return !!Object.keys(this.requestChanges).length;
    } else {
      return !!Object.keys(this.issueChanges).length;
    }
  }

  private isIssueAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.issue?.assignee_ids.some((a) => a === assigneeId);
  }

  private isIssueAuthor(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.issue?.author_id === memberId;
  }

  private isRequestAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.merge_request?.assignee_ids?.some((a) => a === assigneeId);
  }

  private isRequestAuthor(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.merge_request?.author_id === memberId;
  }

  private isRequestReviewer(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.merge_request?.reviewer_ids?.some((a) => a === memberId);
  }

  private get eventPayload() {
    if (this._eventPayload === null) {
      throw new TypeError(
        'Event Payload was not provided within Note Hook Data Parser class. Did you forget to set the event payload value?',
      );
    }
    return this._eventPayload;
  }

  private set eventPayload(payload: GitLabEmojiEvent) {
    this._eventPayload = payload;
  }

  private get requestChanges() {
    if (this._requestChanges === null) {
      throw new TypeError(
        'Request Changes object was not set within Note Hook Data Parser class. Did you forget to set the initial object to the property Request Changes?',
      );
    }
    return this._requestChanges;
  }

  private set requestChanges(changes: RequestChanges) {
    this._requestChanges = changes;
  }

  private get issueChanges(): IssueChanges {
    if (this._issueChanges === null) {
      throw new TypeError(
        'Issue Changes object was not set within Note Hook Data Parser class. Did you forget to set the initial object to the property Issue Changes?',
      );
    }
    return this._issueChanges;
  }

  private set issueChanges(issueChanges: IssueChanges) {
    this._issueChanges = issueChanges;
  }

  private resetContext() {
    this._eventPayload = null;
    this._issueChanges = null;
    this._requestChanges = null;
  }
}
