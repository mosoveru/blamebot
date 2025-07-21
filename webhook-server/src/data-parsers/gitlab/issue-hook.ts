import { DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GitLabIssueEvent, Label, User } from '../../types/gitlab';
import { GitLabEventTypes, ObjectTypes, GitProviders } from '../../constants/enums';
import { BinarySearcher } from '../types';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;
type PossibleChanges = 'title' | 'description' | 'assignees' | 'state_id' | 'due_date' | 'labels';
type ChangesParser = () => void;

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = GitProviders.GITLAB;
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

  constructor(searcher: BinarySearcher) {
    this.performBinarySearchInLists = searcher;
  }

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
    this.eventPayload = JSON.parse(JSON.stringify(eventPayload.eventPayload));
    const changes = this.parseChanges();
    const payload = this.eventPayload;
    if (!changes) {
      return [];
    }
    const eventChangesTemplate = {
      objectType: this.objectType,
      objectUrl: payload.object_attributes.url,
      objectId: String(payload.object_attributes.iid),
      projectUrl: payload.project.web_url,
      projectName: payload.project.name,
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
      if (this.checkIsDeletedAssignee(String(memberId))) {
        formIndividualChanges({
          isUnassigned: true,
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
    const isThereNoChangesInEventPayload = !Object.keys(this.issueChanges).length;
    if (isThereNoChangesInEventPayload) {
      return null;
    }
    return this.issueChanges;
  }

  private isAssignee(assigneeId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.assignees?.some((a) => a.id === assigneeId);
  }

  private isAuthor(memberId: number) {
    const eventPayload = this.eventPayload;
    return eventPayload.object_attributes.author_id === memberId;
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

  private parseChangesForNewCreatedIssue() {
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
      this.parseChangesForNewCreatedIssue();
      return true;
    }
    return false;
  }

  private parseIssueStatus() {
    const eventPayload = this.eventPayload;
    const changes = this.issueChanges;
    if (eventPayload.object_attributes.action === 'close') {
      changes.isClosed = true;
      return;
    }
    if (eventPayload.object_attributes.action === 'reopen') {
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
    const currentAssignees = [...eventPayload.changes.assignees!.current];
    const previousAssignees = [...eventPayload.changes.assignees!.previous];
    const parsedChanges = this.performBinarySearchInLists<User>(currentAssignees, previousAssignees);
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
    const parsedChanges = this.performBinarySearchInLists<Label>(currentLabels, previousLabels);
    const reduceLabels = (label: Label) => label.title;
    changes.isLabelsChanged = {
      added: parsedChanges.added?.map(reduceLabels),
      deleted: parsedChanges.deleted?.map(reduceLabels),
    };
  }

  private readonly performBinarySearchInLists: BinarySearcher;

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

  private resetContext(): void {
    this._issueChanges = null;
    this._eventPayload = null;
  }
}
