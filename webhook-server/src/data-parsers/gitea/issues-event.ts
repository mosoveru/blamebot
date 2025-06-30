import { DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GiteaIssuesEvent } from '../../types/gitea/issues';
import { GiteaEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';
import { GiteaFlavor } from '../../types/gitea';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;

export class IssuesDataParser implements DataParser<GiteaFlavor<GiteaIssuesEvent>> {
  readonly eventType = GiteaEventTypes.ISSUE;
  readonly gitProvider = GitProviders.GITEA;
  readonly objectType = ObjectTypes.ISSUE as const;

  private _issueChanges: IssueChanges | null;
  private _eventPayload: GiteaIssuesEvent | null;
  private changesParsers = {
    assigned: this.parseChangesForAssignedOrUnassigned.bind(this),
    unassigned: this.parseChangesForAssignedOrUnassigned.bind(this),
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
    if (serviceType.eventPayload.combinedProperties && serviceType.eventPayload.combinedProperties.assigned) {
      const assigned = serviceType.eventPayload.combinedProperties.assigned;
      assigned.added.forEach((assigned) => {
        objectMembersIdsSet.add(assigned.id);
      });
    }
    serviceType.eventPayload.issue.assignees.forEach((assignee) => objectMembersIdsSet.add(assignee.id));
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
    const changes = this.parseChanges();
    if (!changes) {
      return [];
    }
    const eventChangesTemplate = {
      objectType: ObjectTypes.ISSUE as const,
      objectUrl: eventPayload.issue.url,
      objectId: String(eventPayload.issue.id),
      projectUrl: eventPayload.repository.url,
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

  private parseChanges() {
    const eventPayload = this.eventPayload;
    this.issueChanges = {};

    if (this.changesParsers[eventPayload.action]) {
      this.changesParsers[eventPayload.action]();
    }

    const changes = this.issueChanges;
    if (!Object.keys(changes).length) {
      return null;
    }

    return changes;
  }

  private isAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.issue.assignees.some((a) => a.id === assigneeId);
  }

  private isAuthor(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.issue.original_author_id === memberId;
  }

  private checkIsNewAssignee(id: string) {
    const changes = this.issueChanges;
    if (changes.isAssigneesChanges?.added) {
      return changes.isAssigneesChanges.added.some((assignee) => assignee.id === id);
    }
  }

  private parseChangesForAssignedOrUnassigned() {
    const payload = this.eventPayload;
    const changes = this.issueChanges;
    if (payload.combinedProperties && payload.combinedProperties.assigned && payload.combinedProperties.unassigned) {
      changes.isAssigneesChanges = {
        added: payload.combinedProperties.assigned.added.map((assignee) => ({
          id: String(assignee.id),
          name: assignee.username,
        })),
        deletedWithoutInfo: true,
      };
    } else if (payload.combinedProperties && payload.combinedProperties.assigned) {
      changes.isAssigneesChanges = {
        added: payload.combinedProperties.assigned.added.map((assignee) => ({
          id: String(assignee.id),
          name: assignee.username,
        })),
      };
    } else {
      changes.isAssigneesChanges = {
        deletedWithoutInfo: true,
      };
    }
  }

  private get eventPayload(): GiteaFlavor<GiteaFlavor<GiteaIssuesEvent>> {
    if (this._eventPayload === null) {
      throw new TypeError('Error in event payload getter');
    }
    return this._eventPayload;
  }

  private set eventPayload(payload: GiteaFlavor<GiteaIssuesEvent>) {
    this._eventPayload = payload;
  }

  private get issueChanges(): IssueChanges {
    if (this._issueChanges === null) {
      throw new TypeError('Error in issueChanges getter');
    }
    return this._issueChanges;
  }

  private set issueChanges(issueChanges: IssueChanges) {
    this._issueChanges = issueChanges;
  }

  private resetContext(): void {
    this._issueChanges = null;
    this._eventPayload = null;
  }
}
