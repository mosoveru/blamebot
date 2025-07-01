import { Changes, DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GiteaIssuesEvent } from '../../types/gitea/issues';
import { GiteaEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';
import { GiteaEvents, GiteaFlavor } from '../../types/gitea';
import { GiteaIssueCommentEvent } from '../../types/gitea/issue_comment';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;

export class IssuesDataParser implements DataParser<GiteaFlavor<GiteaIssuesEvent>> {
  readonly eventType = [GiteaEventTypes.ISSUE, GiteaEventTypes.ISSUE_NOTE];
  readonly gitProvider = GitProviders.GITEA;
  readonly objectType = ObjectTypes.ISSUE as const;

  private _changes: Changes | null;
  private _eventPayload: EventPayload<GiteaFlavor<GiteaEvents>> | null;
  private changesParsers = {
    issues: this.parseChangesForIssues.bind(this),
    issue_comment: this.parseChangesForIssues.bind(this),
  };
  private issuesChangesParsers = {
    assigned: this.parseChangesForAssignedOrUnassigned.bind(this),
    unassigned: this.parseChangesForAssignedOrUnassigned.bind(this),
    reopened: this.parseIssueStatus.bind(this),
    closed: this.parseIssueStatus.bind(this),
    edited: this.parseIssueHeaderChanges.bind(this),
    label_updated: this.parseChangesForLabels.bind(this),
    created: this.parseChangesForNotes.bind(this),
  };

  parseProjectInfo(eventPayload: EventPayload<GiteaFlavor<GiteaIssuesEvent>>) {
    return {
      projectId: String(eventPayload.eventPayload.repository.id),
      projectUrl: eventPayload.eventPayload.repository.url,
      instanceId: eventPayload.instanceId,
      name: eventPayload.eventPayload.repository.name,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GiteaFlavor<GiteaIssuesEvent>>) {
    return {
      instanceId: eventPayload.instanceId,
      objectId: String(eventPayload.eventPayload.issue.id),
      projectId: String(eventPayload.eventPayload.repository.id),
      objectType: ObjectTypes.ISSUE,
      objectUrl: eventPayload.eventPayload.issue.url,
    };
  }

  parseEventMembersIds(serviceType: EventPayload<GiteaFlavor<GiteaIssuesEvent>>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    objectMembersIdsSet.add(serviceType.eventPayload.sender.id);
    const prop = serviceType.eventPayload.combinedProperties;
    if (prop && prop.assigned && prop.assigned.length) {
      prop.assigned.forEach((assigned) => {
        objectMembersIdsSet.add(assigned!.id);
      });
    }
    serviceType.eventPayload.issue.assignees?.forEach((assignee) => objectMembersIdsSet.add(assignee.id));
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GiteaIssuesEvent>): string {
    return String(serviceType.eventPayload.sender.id);
  }

  parseEventChanges({
    eventMembersIds,
    eventPayload,
  }: DataForParsingChanges<GiteaFlavor<GiteaIssuesEvent>>): ChangesForIssue[] {
    this.eventPayload = eventPayload;
    this.changes = {};
    if (this.changesParsers[eventPayload.eventType]) {
      return this.changesParsers[eventPayload.eventType](eventMembersIds);
    } else {
      return [];
    }
  }

  private parseChangesForIssues(eventMembersIds: number[]): ChangesForIssue[] {
    const { eventPayload } = this.eventPayload;
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
      objectId: String(eventPayload.issue.id),
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
    const individualChanges = eventMembersIds.reduce<ChangesForIssue[]>((acc, memberId) => {
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
  }

  private isNewIssue() {
    const { eventPayload } = this.eventPayload;
    return !!eventPayload.combinedProperties?.opened;
  }

  private parseChangesForNewCreatedIssue() {
    const { eventPayload } = this.eventPayload;
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

  private parseChangesForLabels() {
    const changes = this.changes;
    changes.isLabelsChanged = {
      justChanged: true,
    };
  }

  private isAssignee(assigneeId: number) {
    const { eventPayload } = this.eventPayload;
    return eventPayload.issue.assignees?.some((a) => a.id === assigneeId);
  }

  private isAuthor(memberId: number) {
    const { eventPayload } = this.eventPayload;
    return eventPayload.issue.original_author_id === memberId;
  }

  private checkIsNewAssignee(id: string) {
    const changes = this.changes;
    if (changes.isAssigneesChanges?.added) {
      return changes.isAssigneesChanges.added.some((assignee) => assignee.id === id);
    }
  }

  private parseChangesForAssignedOrUnassigned() {
    const changes = this.changes;
    changes.isAssigneesChanges = {
      justChanged: true,
    };
  }

  private parseIssueStatus() {
    const { eventPayload } = this.eventPayload;
    const changes = this.changes;
    if (eventPayload.action === 'closed') {
      changes.isClosed = true;
      return;
    }
    if (eventPayload.action === 'reopened') {
      changes.isReopened = true;
    }
  }

  private parseIssueHeaderChanges() {
    const { eventPayload, eventType } = this.eventPayload as EventPayload<GiteaIssuesEvent>;
    const changes = this.changes;
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
    }
    if (eventPayload.changes.body && eventType !== 'issue_comment') {
      changes.isDescriptionChanged = true;
    }
  }

  parseChangesForNotes() {
    const { eventPayload } = this.eventPayload as EventPayload<GiteaIssueCommentEvent>;
    const changes = this.changes;
    if (eventPayload.comment) {
      changes.newComment = true;
    }
  }

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
