import {
  Changes,
  DataForParsingChanges,
  DataParser,
  EventChanges,
  EventPayload,
  IssueChanges,
  RequestChanges,
} from '../../types';
import { GiteaIssuesEvent } from '../../types/gitea/issues';
import { GiteaEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';
import { GiteaEvents, GiteaEventsWithIssue, GiteaFlavor } from '../../types/gitea';
import { GiteaIssueCommentEvent } from '../../types/gitea/issue_comment';
import { GiteaPullRequestEvent } from '../../types/gitea/pull_request';
import { Sender } from '../../types/gitea/common';

type ChangesForRequestOrIssue = EventChanges<ObjectTypes.ISSUE | ObjectTypes.REQUEST>;

export class GiteaDataParser implements DataParser<GiteaFlavor<GiteaIssuesEvent>> {
  readonly eventType = [
    GiteaEventTypes.ISSUE,
    GiteaEventTypes.ISSUE_NOTE,
    GiteaEventTypes.PULL_REQUEST,
    GiteaEventTypes.PULL_REQUEST_REJECTED,
    GiteaEventTypes.PULL_REQUEST_APPROVED,
    GiteaEventTypes.PULL_REQUEST_COMMENT,
  ];
  readonly gitProvider = GitProviders.GITEA;

  private _changes: Changes | null;
  private _eventPayload: EventPayload<GiteaFlavor<GiteaEvents>> | null;

  private eventsTreatedAsPullRequest = [
    'pull_request',
    'pull_request_rejected',
    'pull_request_approved',
    'pull_request_comment',
  ];

  parseProjectInfo(eventPayload: EventPayload<GiteaFlavor<GiteaEvents>>) {
    return {
      projectId: String(eventPayload.eventPayload.repository.id),
      projectUrl: eventPayload.eventPayload.repository.html_url,
      instanceId: eventPayload.instanceId,
      name: eventPayload.eventPayload.repository.name,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GiteaFlavor<GiteaEvents>>) {
    if (this.isIssueEvent(eventPayload) || this.isIssueCommentEventFromIssue(eventPayload)) {
      const payload = eventPayload as EventPayload<GiteaEventsWithIssue>;
      return {
        instanceId: payload.instanceId,
        objectId: String(payload.eventPayload.issue.id),
        projectId: String(payload.eventPayload.repository.id),
        objectType: ObjectTypes.ISSUE,
        objectUrl: payload.eventPayload.issue.html_url,
      };
    } else {
      const payload = eventPayload as EventPayload<GiteaPullRequestEvent>;
      return {
        instanceId: payload.instanceId,
        objectId: String(payload.eventPayload.pull_request.id),
        projectId: String(payload.eventPayload.repository.id),
        objectType: ObjectTypes.REQUEST,
        objectUrl: payload.eventPayload.pull_request.html_url,
      };
    }
  }

  parseEventMembersIds(payload: EventPayload<GiteaFlavor<GiteaEvents>>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    objectMembersIdsSet.add(payload.eventPayload.sender.id);
    if (this.isIssueEvent(payload) || this.isIssueCommentEventFromIssue(payload)) {
      const eventPayload = payload.eventPayload as GiteaFlavor<GiteaEventsWithIssue>;
      const prop = eventPayload.combinedProperties;
      if (prop && prop.assigned && prop.assigned.length) {
        prop.assigned.forEach((assigned) => {
          objectMembersIdsSet.add(assigned!.id);
        });
      }
      eventPayload.issue.assignees?.forEach((assignee) => objectMembersIdsSet.add(assignee.id));
    }
    if (
      this.eventsTreatedAsPullRequest.includes(payload.eventType) ||
      this.isIssueCommentEventFromPullRequest(payload)
    ) {
      const eventPayload = payload.eventPayload as GiteaFlavor<GiteaPullRequestEvent>;
      const prop = eventPayload.combinedProperties;
      if (prop && prop.assigned && prop.assigned.length) {
        prop.assigned.forEach((assigned) => {
          objectMembersIdsSet.add(assigned!.id);
        });
      }
      if (prop && (prop.addedReviewers || prop.deletedReviewers)) {
        prop.addedReviewers?.forEach((reviewer) => objectMembersIdsSet.add(reviewer.id));
        prop.deletedReviewers?.forEach((reviewer) => objectMembersIdsSet.add(reviewer.id));
      }
      eventPayload.pull_request.assignees?.forEach((assignee) => objectMembersIdsSet.add(assignee.id));
      eventPayload.pull_request.requested_reviewers?.forEach((reviewer) => objectMembersIdsSet.add(reviewer.id));
    }
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GiteaEvents>): string {
    return String(serviceType.eventPayload.sender.id);
  }

  parseEventChanges({
    eventMembersIds,
    eventPayload,
  }: DataForParsingChanges<GiteaFlavor<GiteaEvents>>): ChangesForRequestOrIssue[] {
    this.eventPayload = eventPayload;
    this.changes = {};
    if (this.isIssueCommentEvent(eventPayload) && eventPayload.eventPayload.is_pull) {
      return this.parseChangesForPullRequest(eventMembersIds);
    }
    if (this.changesParsers[eventPayload.eventType]) {
      return this.changesParsers[eventPayload.eventType](eventMembersIds);
    } else {
      return [];
    }
  }

  private parseChangesForIssues = (eventMembersIds: number[]): ChangesForRequestOrIssue[] => {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaEventsWithIssue>;
    const action = eventPayload.action;
    if (this.isNewIssue()) {
      this.parseChangesForNewCreatedIssue();
    } else if (this.issuesChangesParsers[action]) {
      this.issuesChangesParsers[action]();
    } else {
      return [];
    }

    const changes = this.changes;
    if (!Object.keys(changes).length) {
      return [];
    }

    const eventChangesTemplate = {
      objectType: ObjectTypes.ISSUE as const,
      objectUrl: eventPayload.issue.html_url,
      objectId: String(eventPayload.issue.number),
      projectUrl: eventPayload.repository.html_url,
      projectName: eventPayload.repository.name,
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
      if (this.isAssignee(memberId)) {
        formIndividualChanges({
          isNewAssignment: this.checkIsNewAssignee(String(memberId)),
          forAssignee: true,
        });
        return acc;
      }
      if (this.isAuthor(memberId)) {
        formIndividualChanges({
          forAuthor: true,
        });
      }
      return acc;
    }, []);
    this.resetContext();
    return [...individualChanges, commonChanges];
  };

  private parseChangesForPullRequest = (eventMembersIds: number[]): ChangesForRequestOrIssue[] => {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaPullRequestEvent>;
    const action = eventPayload.action;
    if (this.isNewPullRequest()) {
      this.parseChangesForNewCreatedPullRequest();
    } else if (this.pullRequestChangesParsers[action]) {
      this.pullRequestChangesParsers[action]();
    } else {
      return [];
    }

    const changes = this.changes;
    if (!Object.keys(changes).length) {
      return [];
    }

    const eventChangesTemplate = {
      objectType: ObjectTypes.REQUEST as const,
      objectUrl: eventPayload.pull_request.html_url,
      objectId: String(eventPayload.pull_request.number),
      projectUrl: eventPayload.repository.html_url,
      projectName: eventPayload.repository.name,
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
      if (this.isAssignee(memberId)) {
        formIndividualChanges({
          isNewAssignment: this.checkIsNewAssignee(String(memberId)),
          forAssignee: true,
        });
        return acc;
      }
      if (this.checkIsUnassignedReviewer(String(memberId))) {
        formIndividualChanges({
          isUnassignedReviewer: true,
          forReviewer: true,
        });
        return acc;
      }
      if (this.isReviewer(memberId)) {
        formIndividualChanges({
          isNewReviewer: this.checkIsNewReviewer(String(memberId)),
          forReviewer: true,
        });
        return acc;
      }
      if (this.isAuthor(memberId)) {
        formIndividualChanges({
          forAuthor: true,
        });
      }
      return acc;
    }, []);
    this.resetContext();
    return [...individualChanges, commonChanges];
  };

  private isAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    if (this.isIssueEvent(eventPayload) || this.isIssueCommentEventFromIssue(eventPayload)) {
      return eventPayload.eventPayload.issue.assignees?.some((a) => a.id === assigneeId);
    } else {
      return (eventPayload as EventPayload<GiteaPullRequestEvent>).eventPayload.pull_request.assignees?.some(
        (a) => a.id === assigneeId,
      );
    }
  }

  private isAuthor(memberId: number) {
    const eventPayload = this.eventPayload as EventPayload<GiteaEvents>;
    if (this.isIssueEvent(eventPayload) || this.isIssueCommentEventFromIssue(eventPayload)) {
      return (eventPayload as EventPayload<GiteaEventsWithIssue>).eventPayload.issue.original_author_id === memberId;
    } else {
      return (eventPayload as EventPayload<GiteaPullRequestEvent>).eventPayload.pull_request.user.id === memberId;
    }
  }

  private isReviewer(memberId: number) {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaPullRequestEvent>;
    const inRequestedReviewer = eventPayload.requested_reviewer?.id === memberId;
    const inRequestedReviewers = eventPayload.pull_request.requested_reviewers?.some((a) => a.id === memberId);
    return inRequestedReviewer || inRequestedReviewers;
  }

  private checkIsNewAssignee(id: string) {
    const changes = this.changes;
    if (changes.isAssigneesChanges?.added) {
      return changes.isAssigneesChanges.added.some((assignee) => assignee.id === id);
    }
  }

  private checkIsNewReviewer(id: string) {
    const changes = this.changes;
    if (changes.isReviewerChanges?.added) {
      return changes.isReviewerChanges.added.some((assignee) => assignee.id === id);
    }
    return false;
  }

  private checkIsUnassignedReviewer(id: string) {
    const changes = this.changes;
    if (changes.isReviewerChanges?.deleted) {
      return changes.isReviewerChanges.deleted.some((assignee) => assignee.id === id);
    }
    return false;
  }

  private isNewIssue() {
    const { eventPayload } = this.eventPayload;
    return !!eventPayload.combinedProperties?.opened;
  }

  private isNewPullRequest() {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaFlavor<GiteaPullRequestEvent>>;
    return !!eventPayload.combinedProperties?.opened;
  }

  private parseChangesForNewCreatedIssue() {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaFlavor<GiteaEventsWithIssue>>;
    const changes = this.changes;
    if (eventPayload.combinedProperties?.assigned?.length && eventPayload.issue.due_date) {
      changes.isNewObject = {
        isNewAssignmentWithDeadline: {
          deadline: eventPayload.issue.due_date,
        },
      };
    } else if (eventPayload.combinedProperties?.assigned?.length) {
      changes.isNewObject = {
        isNewAssignment: true,
      };
    }
  }

  private parseChangesForNewCreatedPullRequest() {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaFlavor<GiteaPullRequestEvent>>;
    const requestChanges = this.changes;
    if (eventPayload.combinedProperties?.assigned?.length && eventPayload.combinedProperties?.addedReviewers?.length) {
      requestChanges.isNewObject = {
        withAssignment: true,
        withReviewer: true,
      };
    } else if (eventPayload.combinedProperties?.addedReviewers?.length) {
      requestChanges.isNewObject = {
        withReviewer: true,
      };
    } else if (eventPayload.combinedProperties?.assigned?.length) {
      requestChanges.isNewObject = {
        withAssignment: true,
      };
    }
  }

  private parseChangesForLabels = () => {
    const changes = this.changes;
    changes.isLabelsChanged = {
      justChanged: true,
    };
  };

  private parseChangesForReviewers = () => {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaFlavor<GiteaPullRequestEvent>>;
    const changes = this.changes;
    const addedAndDeleted =
      !!eventPayload.combinedProperties?.addedReviewers && !!eventPayload.combinedProperties?.deletedReviewers;
    const onlyAdded = !!eventPayload.combinedProperties?.addedReviewers;
    const reduceReviewers = (reviewer: Sender) => ({
      id: String(reviewer.id),
      name: reviewer.username,
    });
    if (addedAndDeleted) {
      changes.isReviewerChanges = {
        added: eventPayload.combinedProperties?.addedReviewers?.map(reduceReviewers),
        deleted: eventPayload.combinedProperties?.deletedReviewers?.map(reduceReviewers),
      };
    } else if (onlyAdded) {
      changes.isReviewerChanges = {
        added: eventPayload.combinedProperties?.addedReviewers?.map(reduceReviewers),
      };
    } else {
      changes.isReviewerChanges = {
        deleted: eventPayload.combinedProperties?.deletedReviewers?.map(reduceReviewers),
      };
    }
  };

  private parseChangesForAssignedOrUnassigned = () => {
    const changes = this.changes;
    changes.isAssigneesChanges = {
      justChanged: true,
    };
  };

  private parseIssueStatus = () => {
    const { eventPayload } = this.eventPayload;
    const changes = this.changes;
    if (eventPayload.action === 'closed') {
      changes.isClosed = true;
      return;
    }
    if (eventPayload.action === 'reopened') {
      changes.isReopened = true;
    }
  };

  private parsePullRequestStatus = () => {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaPullRequestEvent>;
    const changes = this.changes;
    if (eventPayload.action === 'closed' && eventPayload.pull_request.merged) {
      changes.isMerged = {
        source_branch: eventPayload.pull_request.head.label,
        target_branch: eventPayload.pull_request.base.label,
      };
    }
    if (eventPayload.action === 'closed' && !eventPayload.pull_request.merged) {
      changes.isClosed = true;
    }
    if (eventPayload.action === 'reopened') {
      changes.isReopened = true;
    }
  };

  private parseObjectHeaderChanges = () => {
    const { eventPayload, eventType } = this.eventPayload as EventPayload<GiteaIssuesEvent>;
    const changes = this.changes;
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
    }
    if (eventPayload.changes.body && eventType !== 'issue_comment') {
      changes.isDescriptionChanged = true;
    }
  };

  parseChangesForNotes = () => {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaIssueCommentEvent>;
    const changes = this.changes;
    if (eventPayload.comment) {
      changes.newComment = true;
    }
  };

  parseChangesForReviewedPullRequest = () => {
    const eventPayload = this.eventPayload as EventPayload<GiteaPullRequestEvent>;
    const changes = this.changes;
    if (eventPayload.eventType === 'pull_request_rejected') {
      changes.isRequestRejected = true;
    }
    if (eventPayload.eventType === 'pull_request_approved') {
      changes.isApproved = {
        by: eventPayload.eventPayload.sender.username,
      };
    }
    if (eventPayload.eventType === 'pull_request_comment') {
      changes.newComment = true;
    }
  };

  private isIssueCommentEvent(
    eventPayload: EventPayload<GiteaEvents>,
  ): eventPayload is EventPayload<GiteaIssueCommentEvent> {
    return eventPayload.eventType === 'issue_comment';
  }

  private isIssueCommentEventFromPullRequest(eventPayload: EventPayload<GiteaEvents>) {
    return this.isIssueCommentEvent(eventPayload) && eventPayload.eventPayload.is_pull;
  }

  private isIssueCommentEventFromIssue(
    eventPayload: EventPayload<GiteaEvents>,
  ): eventPayload is EventPayload<GiteaIssueCommentEvent> {
    return this.isIssueCommentEvent(eventPayload) && !eventPayload.eventPayload.is_pull;
  }

  private isPullRequestEvent(
    eventPayload: EventPayload<GiteaEvents>,
  ): eventPayload is EventPayload<GiteaPullRequestEvent> {
    return eventPayload.eventType === 'pull_request';
  }

  private isIssueEvent(eventPayload: EventPayload<GiteaEvents>): eventPayload is EventPayload<GiteaIssuesEvent> {
    return eventPayload.eventType === 'issues';
  }

  private changesParsers = {
    issues: this.parseChangesForIssues,
    issue_comment: this.parseChangesForIssues,
    pull_request: this.parseChangesForPullRequest,
    pull_request_rejected: this.parseChangesForPullRequest,
    pull_request_approved: this.parseChangesForPullRequest,
    pull_request_comment: this.parseChangesForPullRequest,
  };
  private issuesChangesParsers = {
    assigned: this.parseChangesForAssignedOrUnassigned,
    unassigned: this.parseChangesForAssignedOrUnassigned,
    reopened: this.parseIssueStatus,
    closed: this.parseIssueStatus,
    edited: this.parseObjectHeaderChanges,
    label_updated: this.parseChangesForLabels,
    created: this.parseChangesForNotes,
  };
  private pullRequestChangesParsers = {
    assigned: this.parseChangesForAssignedOrUnassigned,
    unassigned: this.parseChangesForAssignedOrUnassigned,
    label_updated: this.parseChangesForLabels,
    review_request_removed: this.parseChangesForReviewers,
    review_requested: this.parseChangesForReviewers,
    edited: this.parseObjectHeaderChanges,
    created: this.parseChangesForNotes,
    reviewed: this.parseChangesForReviewedPullRequest,
    closed: this.parsePullRequestStatus,
    reopened: this.parsePullRequestStatus,
  };

  private get eventPayload(): EventPayload<GiteaFlavor<GiteaEvents>> {
    if (this._eventPayload === null) {
      throw new TypeError('Error in event payload getter');
    }
    return this._eventPayload;
  }

  private set eventPayload(payload: EventPayload<GiteaFlavor<GiteaEvents>>) {
    this._eventPayload = payload;
  }

  private get changes(): Changes {
    if (this._changes === null) {
      throw new TypeError('Error in changes getter');
    }
    return this._changes;
  }

  private set changes(changes: Changes) {
    this._changes = changes;
  }

  private resetContext(): void {
    this._changes = null;
    this._eventPayload = null;
  }
}
