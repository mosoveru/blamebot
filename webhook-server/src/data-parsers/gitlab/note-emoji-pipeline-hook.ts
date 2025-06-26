import {
  Changes,
  DataForParsingChanges,
  DataParser,
  EventChanges,
  EventPayload,
  IssueChanges,
  RequestChanges,
} from '../../types';
import { GitLabEmojiEvent, GitLabNoteHookEvent, GitLabPipelineEvent } from '../../types/gitlab';
import { GitLabEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';

type ChangesForRequestOrIssue = EventChanges<ObjectTypes.ISSUE | ObjectTypes.REQUEST>;
type SimilarGitLabEvents = GitLabNoteHookEvent | GitLabEmojiEvent | GitLabPipelineEvent;
type WithMRsAndIssues = GitLabNoteHookEvent | GitLabEmojiEvent;

export class NoteEmojiPipelineHookDataParser implements DataParser<SimilarGitLabEvents> {
  readonly eventType = [GitLabEventTypes.NOTE, GitLabEventTypes.EMOJI, GitLabEventTypes.PIPELINE];
  readonly gitProvider = GitProviders.GITLAB;

  private _changes: Changes | null;
  private _eventPayload: SimilarGitLabEvents | null;

  private changesParsers = {
    pipeline: this.parseChangesForPipelines.bind(this),
    emoji: {
      merge_request: this.parseChangesForEmojis.bind(this),
      issue: this.parseChangesForEmojis.bind(this),
    },
    note: {
      merge_request: this.parseChangesForNotes.bind(this),
      issue: this.parseChangesForNotes.bind(this),
    },
  };

  private utils = {
    formChangesObject: <T extends SimilarGitLabEvents, K extends Changes>({
      eventPayload,
      changes,
      particularChanges,
      isCommon,
      meantFor,
    }: {
      eventPayload: T;
      changes: Partial<K>;
      isCommon: boolean;
      particularChanges?: Partial<K>;
      meantFor: 'request' | 'issue';
    }) => {
      if (meantFor === 'request') {
        return {
          objectType: ObjectTypes.REQUEST as const,
          objectUrl: eventPayload.merge_request!.url,
          objectId: String(eventPayload.merge_request!.id),
          projectUrl: eventPayload.project.web_url,
          projectName: eventPayload.project.name,
          isCommon,
          changes: {
            ...changes,
            ...particularChanges,
          },
        } satisfies EventChanges<ObjectTypes.REQUEST>;
      } else {
        return {
          objectType: ObjectTypes.ISSUE as const,
          objectUrl: (eventPayload as WithMRsAndIssues).issue!.url,
          objectId: String((eventPayload as WithMRsAndIssues).issue!.id),
          projectUrl: eventPayload.project.web_url,
          projectName: eventPayload.project.name,
          isCommon,
          changes: {
            ...changes,
            ...particularChanges,
          },
        } satisfies EventChanges<ObjectTypes.ISSUE>;
      }
    },
    linkChangesToUser: (changes: EventChanges<any>, instanceUserId: string) => {
      changes.instanceUserId = instanceUserId;
      return changes;
    },
  };

  parseProjectInfo(eventPayload: EventPayload<SimilarGitLabEvents>) {
    return {
      instanceId: eventPayload.instanceId,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<SimilarGitLabEvents>) {
    if (eventPayload.eventPayload.object_kind !== 'pipeline' && eventPayload.eventPayload.issue) {
      return {
        instanceId: eventPayload.instanceId,
        objectId: String(eventPayload.eventPayload.issue.id),
        projectId: String(eventPayload.eventPayload.project.id),
        objectType: ObjectTypes.ISSUE,
        objectUrl: eventPayload.eventPayload.issue.url,
      };
    } else {
      return {
        instanceId: eventPayload.instanceId,
        objectId: String(eventPayload.eventPayload.merge_request!.id),
        projectId: String(eventPayload.eventPayload.project.id),
        objectType: ObjectTypes.REQUEST,
        objectUrl: eventPayload.eventPayload.merge_request!.url,
      };
    }
  }

  parseEventMembersIds(serviceType: EventPayload<SimilarGitLabEvents>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    if (serviceType.eventPayload.object_kind === 'pipeline') {
      for (const build of serviceType.eventPayload.builds) {
        objectMembersIdsSet.add(build.user.id);
      }
      objectMembersIdsSet.add(serviceType.eventPayload.user.id);
      for (const id of objectMembersIdsSet) {
        objectMembersIds.push(id);
      }
    } else if (serviceType.eventPayload.merge_request) {
      objectMembersIdsSet.add(serviceType.eventPayload.merge_request.author_id);
      serviceType.eventPayload.merge_request.assignee_ids.forEach((assigneeId) => objectMembersIdsSet.add(assigneeId));
      serviceType.eventPayload.merge_request.reviewer_ids.forEach((reviewerId) => objectMembersIdsSet.add(reviewerId));
    } else if (serviceType.eventPayload.issue) {
      objectMembersIdsSet.add(serviceType.eventPayload.issue.author_id);
      serviceType.eventPayload.issue.assignee_ids.forEach((assigneeId) => objectMembersIdsSet.add(assigneeId));
    }
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<SimilarGitLabEvents>): string {
    if (serviceType.eventPayload.object_kind === 'pipeline') {
      // Do not exclude the event initiator for pipeline events
      return '-1';
    }
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({ eventMembersIds, eventPayload }: DataForParsingChanges<SimilarGitLabEvents>) {
    this.eventPayload = eventPayload;
    this.changes = {};
    if (eventPayload.object_kind === 'pipeline') {
      this.changesParsers.pipeline();
      return this.findChangesInMergeRequest(eventMembersIds);
    } else {
      const parser = this.changesParsers[eventPayload.object_kind];
      if (eventPayload.merge_request) {
        parser.merge_request();
        return this.findChangesInMergeRequest(eventMembersIds);
      } else {
        parser.issue();
        return this.findChangesInIssue(eventMembersIds);
      }
    }
  }

  private findChangesInIssue(eventMembersIds: number[]) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    const changes = this.changes as IssueChanges;
    if (!this.checkIsThereAnyChanges()) {
      return [];
    }
    const commonChanges = this.utils.formChangesObject({
      eventPayload,
      changes,
      isCommon: true,
      meantFor: 'issue',
    });
    const individualChanges = eventMembersIds.reduce<ChangesForRequestOrIssue[]>((acc, memberId) => {
      if (this.isIssueAssignee(memberId)) {
        const formedChanges = this.utils.formChangesObject({
          eventPayload,
          isCommon: false,
          changes,
          meantFor: 'issue',
          particularChanges: {
            forAssignee: true,
          },
        });
        acc.push(this.utils.linkChangesToUser(formedChanges, String(memberId)));
        return acc;
      }
      if (this.isIssueAuthor(memberId)) {
        const formedChanges = this.utils.formChangesObject({
          eventPayload,
          isCommon: false,
          changes,
          meantFor: 'issue',
          particularChanges: {
            forAuthor: true,
          },
        });
        acc.push(this.utils.linkChangesToUser(formedChanges, String(memberId)));
        return acc;
      }
      return acc;
    }, []);
    this.resetContext();
    return [...individualChanges, commonChanges];
  }

  private findChangesInMergeRequest(eventMembersIds: number[]) {
    const eventPayload = this.eventPayload;
    const changes = this.changes as RequestChanges;
    if (!this.checkIsThereAnyChanges()) {
      return [];
    }
    const commonChanges = this.utils.formChangesObject({
      eventPayload,
      changes,
      isCommon: true,
      meantFor: 'request',
    });
    const individualChanges = eventMembersIds.reduce<ChangesForRequestOrIssue[]>((acc, memberId) => {
      if (this.isRequestAssignee(memberId)) {
        const formedChanges = this.utils.formChangesObject({
          eventPayload,
          isCommon: false,
          changes,
          meantFor: 'request',
          particularChanges: {
            forAssignee: true,
          },
        });
        acc.push(this.utils.linkChangesToUser(formedChanges, String(memberId)));
        return acc;
      }
      if (this.isRequestReviewer(memberId)) {
        const formedChanges = this.utils.formChangesObject({
          eventPayload,
          isCommon: false,
          changes,
          meantFor: 'request',
          particularChanges: {
            forReviewer: true,
          },
        });
        acc.push(this.utils.linkChangesToUser(formedChanges, String(memberId)));
        return acc;
      }
      if (this.isRequestAuthor(memberId)) {
        const formedChanges = this.utils.formChangesObject({
          eventPayload,
          isCommon: false,
          changes,
          meantFor: 'request',
          particularChanges: {
            forAuthor: true,
          },
        });
        acc.push(this.utils.linkChangesToUser(formedChanges, String(memberId)));
        return acc;
      }
      return acc;
    }, []);
    this.resetContext();
    return [...individualChanges, commonChanges];
  }

  private checkIsThereAnyChanges() {
    return !!Object.keys(this.changes).length;
  }

  private isIssueAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    return eventPayload.issue?.assignee_ids.some((a) => a === assigneeId);
  }

  private isIssueAuthor(memberId: number) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    return eventPayload.issue?.author_id === memberId;
  }

  private isRequestAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    return eventPayload.merge_request?.assignee_ids?.some((a) => a === assigneeId);
  }

  private isRequestAuthor(memberId: number) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    return eventPayload.merge_request?.author_id === memberId;
  }

  private isRequestReviewer(memberId: number) {
    const eventPayload = this.eventPayload as WithMRsAndIssues;
    return eventPayload.merge_request?.reviewer_ids?.some((a) => a === memberId);
  }

  private parseChangesForEmojis() {
    const eventPayload = this.eventPayload as GitLabEmojiEvent;
    const changes = this.changes;
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
    } else {
      changes.isEmojiChanged = {
        isDeleted: generateEmojiChanges(eventPayload.object_attributes),
      };
    }
  }

  private parseChangesForPipelines() {
    const eventPayload = this.eventPayload as GitLabPipelineEvent;
    const changes = this.changes;
    if (eventPayload.object_attributes.status === 'pending') {
      changes.pipelineChanges = {
        isPipelinePending: true,
      };
    }
    if (eventPayload.object_attributes.status === 'failed') {
      changes.pipelineChanges = {
        isPipelineFailed: true,
      };
    }
    if (eventPayload.object_attributes.status === 'success') {
      changes.pipelineChanges = {
        isPipelinePassed: true,
      };
    }
  }

  parseChangesForNotes() {
    const eventPayload = this.eventPayload as GitLabNoteHookEvent;
    const changes = this.changes;
    if (!eventPayload.object_attributes.type) {
      changes.newComment = true;
    }
    if (eventPayload.object_attributes.type === 'DiffNote') {
      (changes as RequestChanges).newCommentOnFiles = true;
    }
  }

  private get eventPayload() {
    if (this._eventPayload === null) {
      throw new TypeError(
        'Event Payload was not provided within Note Hook Data Parser class. Did you forget to set the event payload value?',
      );
    }
    return this._eventPayload;
  }

  private set eventPayload(payload: SimilarGitLabEvents) {
    this._eventPayload = payload;
  }

  private get changes(): Changes {
    if (this._changes === null) {
      throw new TypeError(
        'Issue Changes object was not set within Note Hook Data Parser class. Did you forget to set the initial object to the property Issue Changes?',
      );
    }
    return this._changes;
  }

  private set changes(changes: Changes) {
    this._changes = changes;
  }

  private resetContext() {
    this._eventPayload = null;
    this._changes = null;
  }
}
