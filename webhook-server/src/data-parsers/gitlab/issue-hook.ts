import { DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GitLabIssueEvent, Label, User } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;
type PossibleChanges = 'title' | 'description' | 'assignees' | 'state_id' | 'due_date' | 'labels';
type ChangesParser = () => void;

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly objectType = ObjectTypes.ISSUE as const;
  private readonly eventChangesParsers: Record<PossibleChanges, ChangesParser> = {
    due_date: this.parseChangesForDueDate.bind(this),
    labels: this.parseChangesForLabels.bind(this),
    state_id: this.parseIssueStatus.bind(this),
    description: this.parseIssueHeaderChanges.bind(this),
    title: this.parseIssueHeaderChanges.bind(this),
    assignees: this.parseChangesForAssignees.bind(this),
  };
  private _issueChanges: IssueChanges | null;
  private _eventPayload: GitLabIssueEvent | null;

  parseProjectInfo(eventPayload: EventPayload<GitLabIssueEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabIssueEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      objectId: String(eventPayload.eventPayload.object_attributes.id),
      projectId: String(eventPayload.eventPayload.project.id),
      objectType: ObjectTypes.ISSUE,
      objectUrl: eventPayload.eventPayload.object_attributes.url,
    };
  }

  parseEventMembersIds(serviceType: EventPayload<GitLabIssueEvent>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    objectMembersIdsSet.add(serviceType.eventPayload.object_attributes.author_id);
    serviceType.eventPayload.object_attributes.assignee_ids.forEach((assigneeId) =>
      objectMembersIdsSet.add(assigneeId),
    );
    if (serviceType.eventPayload.changes.assignees?.previous) {
      const previousAssignees = serviceType.eventPayload.changes.assignees?.previous;
      for (const assignee of previousAssignees) {
        objectMembersIdsSet.add(assignee.id);
      }
    }
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabIssueEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({ eventMembersIds, eventPayload }: DataForParsingChanges<GitLabIssueEvent>): ChangesForIssue[] {
    this.eventPayload = eventPayload;
    const eventChangesTemplate = {
      objectType: this.objectType,
      objectUrl: eventPayload.object_attributes.url,
      objectId: String(eventPayload.object_attributes.id),
      projectUrl: eventPayload.project.web_url,
      projectName: eventPayload.project.name,
    };
    const changes = this.parseChanges();
    const commonChanges = {
      ...eventChangesTemplate,
      changes: {
        ...changes,
      },
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<ChangesForIssue[]>((acc, memberId) => {
      const isAssignee = eventPayload.assignees?.some((assignee) => memberId === assignee.id);
      if (isAssignee) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...changes,
            isNewAssignment: this.checkIsNewAssignee(String(memberId)),
            forAssignee: true,
          },
        });
        return acc;
      }
      if (this.checkIsDeletedAssignee(String(memberId))) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...changes,
            isUnassigned: true,
            forAssignee: true,
          },
        });
        return acc;
      }
      const isAuthor = eventPayload.object_attributes.author_id === memberId;
      if (isAuthor) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...changes,
            forAuthor: true,
          },
        });
        return acc;
      }
      return acc;
    }, []);
    this.resetAll();
    return [...individualChanges, commonChanges];
  }

  private parseChanges() {
    this.issueChanges = {};
    const eventPayload = this.eventPayload;
    if (this.isNewObject()) {
      return this.issueChanges;
    }
    const changesKeys = Object.keys(eventPayload.changes);
    for (const key of changesKeys) {
      if (this.eventChangesParsers[key]) {
        this.eventChangesParsers[key]();
      }
    }
    return this.issueChanges;
  }

  private checkIsNewAssignee(id: string) {
    const changes = this.issueChanges;
    if (changes.isAssigneesChanges?.added) {
      return changes.isAssigneesChanges.added.some((assignee) => assignee.id === id);
    }
  }

  private checkIsDeletedAssignee(id: string) {
    const changes = this.issueChanges;
    if (changes.isAssigneesChanges?.deleted) {
      return changes.isAssigneesChanges.deleted.some((assignee) => assignee.id === id);
    }
  }

  private isNewCreatedIssueWithChanges() {
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    if (eventPayload.assignees?.length && eventPayload.changes.due_date && eventPayload.changes.due_date.current) {
      changes.isNewObject = {
        isNewAssignmentWithDeadline: {
          deadline: eventPayload.changes.due_date.current,
        },
      };
    } else if (eventPayload.assignees?.length) {
      changes.isNewObject = {
        isNewAssignment: true,
      };
    }
  }

  private isNewObject() {
    const eventPayload = this.eventPayload;
    if (!!eventPayload.changes.id) {
      this.isNewCreatedIssueWithChanges();
      return true;
    }
    return false;
  }

  private parseIssueStatus() {
    // TODO: Использовать атрибут action. Решить проблему с двойным вебхуком
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    const stateId = eventPayload.changes.state_id;
    const isIssueClosed = !!(stateId && stateId.current === 2);
    if (isIssueClosed) {
      changes.isClosed = true;
      return;
    }
    const isIssueReopened = !!(stateId && !eventPayload.changes.created_at);
    if (isIssueReopened) {
      changes.isReopened = true;
    }
  }

  private parseIssueHeaderChanges() {
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
    }
    if (eventPayload.changes.description) {
      changes.isDescriptionChanged = true;
    }
  }

  private parseChangesForDueDate() {
    const dueDate = this.eventPayload.changes.due_date!;
    const changes = this.issueChanges;
    const isDueDateUpdated = !!dueDate.current && !!dueDate.previous;
    const isDueDateAdded = !!dueDate.current && !dueDate.previous;
    if (isDueDateUpdated) {
      changes.isDueDateChanged = {
        isUpdated: {
          due_date: dueDate.current!,
        },
      };
      return;
    }
    if (isDueDateAdded) {
      changes.isDueDateChanged = {
        isAdded: {
          due_date: dueDate.current!,
        },
      };
      return;
    }
    changes.isDueDateChanged = {
      isDeleted: true,
    };
  }

  private parseChangesForAssignees() {
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    console.log(eventPayload);
    console.log(changes);
    const currentAssignees = [...eventPayload.changes.assignees!.current];
    const previousAssignees = [...eventPayload.changes.assignees!.previous];
    const parsedChanges = this.performBinarySearchInLists(currentAssignees, previousAssignees);
    const reduceAssignees = (assignee: User) => ({
      id: String(assignee.id),
      name: assignee.name,
    });
    changes.isAssigneesChanges = {
      added: parsedChanges.added?.map(reduceAssignees),
      deleted: parsedChanges?.deleted?.map(reduceAssignees),
    };
  }

  private parseChangesForLabels() {
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    const currentLabels = [...eventPayload.changes.labels!.current];
    const previousLabels = [...eventPayload.changes.labels!.previous];
    const parsedChanges = this.performBinarySearchInLists(currentLabels, previousLabels);
    const reduceLabels = (label: Label) => label.title;
    changes.isLabelsChanged = {
      added: parsedChanges.added?.map(reduceLabels),
      deleted: parsedChanges.deleted?.map(reduceLabels),
    };
  }

  private performBinarySearchInLists<T extends Label | User>(currentSortedList: T[], previousList: T[]) {
    const addedEntities: T[] = [...currentSortedList].sort((a, b) => a.id - b.id);
    const deletedEntities: T[] = [];

    while (previousList.length) {
      const element = previousList.pop()!;

      let left = 0;
      let right = addedEntities.length - 1;
      let isChanged = false;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (addedEntities[mid].id === element.id) {
          addedEntities.splice(mid, 1);
          isChanged = true;
          break;
        }

        if (addedEntities[mid].id < element.id) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      if (!isChanged) {
        deletedEntities.push(element);
      }
    }
    if (!deletedEntities.length) {
      return {
        added: addedEntities,
      };
    }
    if (!addedEntities.length) {
      return {
        deleted: deletedEntities,
      };
    }
    return {
      added: addedEntities,
      deleted: deletedEntities,
    };
  }

  private get eventPayload(): GitLabIssueEvent {
    if (this._eventPayload === null) {
      throw new TypeError(
        'Event Payload was not provided within Issue Hook Data Parser class. Did you forget to set the event payload value?',
      );
    }
    return this._eventPayload;
  }

  private set eventPayload(payload: GitLabIssueEvent) {
    this._eventPayload = payload;
  }

  private get issueChanges(): IssueChanges {
    if (this._issueChanges === null) {
      throw new TypeError(
        'Issue Changes object was not set within Issue Hook Data Parser class. Did you forget to set the initial object to the property Issue Changes?',
      );
    }
    return this._issueChanges;
  }

  private set issueChanges(issueChanges: IssueChanges) {
    this._issueChanges = issueChanges;
  }

  private resetAll(): void {
    this._issueChanges = null;
    this._eventPayload = null;
  }
}
