import { DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GitLabIssueEvent, Label, User } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly objectType = ObjectTypes.ISSUE as const;

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
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabIssueEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({ eventMembersIds, eventPayload }: DataForParsingChanges<GitLabIssueEvent>): ChangesForIssue[] {
    const eventChangesTemplate = {
      objectType: this.objectType,
      objectUrl: eventPayload.object_attributes.url,
      objectId: String(eventPayload.object_attributes.id),
      isNewObject: this.isNewObject(eventPayload),
      projectUrl: eventPayload.project.web_url,
      projectName: eventPayload.project.name,
    };
    const eventChanges = this.parseChanges(eventPayload);
    const commonChanges = {
      ...eventChangesTemplate,
      changes: eventChanges,
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<ChangesForIssue[]>((acc, memberId) => {
      if (this.checkIsNewAssignee(eventChanges, String(memberId))) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...eventChanges,
            isNewAssignment: true,
            forAssignee: true,
          },
        });
        return acc;
      }
      if (this.checkIsDeletedAssignee(eventChanges, String(memberId))) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...eventChanges,
            isUnassigned: true,
            forAssignee: true,
          },
        });
        return acc;
      }
      const isAuthor = eventPayload.object_attributes.author_id === memberId;
      if (isAuthor && eventChanges) {
        acc.push({
          ...eventChangesTemplate,
          instanceUserId: String(memberId),
          isCommon: false,
          changes: {
            ...eventChanges,
            forAuthor: true,
          },
        });
        return acc;
      }
      return acc;
    }, []);
    return [...individualChanges, commonChanges];
  }

  private checkIsNewAssignee(changes: IssueChanges, id: string) {
    if (changes.isAssigneesAddedAndDeleted) {
      return changes.isAssigneesAddedAndDeleted.added.some((assignee) => assignee.id === id);
    }
    if (changes.isAssigneesAdded) {
      return changes.isAssigneesAdded.added.some((assignee) => assignee.id === id);
    }
  }

  private checkIsDeletedAssignee(changes: IssueChanges, id: string) {
    if (changes.isAssigneesAddedAndDeleted) {
      return changes.isAssigneesAddedAndDeleted.deleted.some((assignee) => assignee.id === id);
    }
    if (changes.isAssigneesDeleted) {
      return changes.isAssigneesDeleted.deleted.some((assignee) => assignee.id === id);
    }
  }

  private isNewCreatedIssueWithChanges(eventPayload: GitLabIssueEvent) {
    if (eventPayload.assignees?.length && eventPayload.changes.due_date && eventPayload.changes.due_date.current) {
      return {
        isNewAssignmentWithDeadline: {
          deadline: eventPayload.changes.due_date.current,
        },
      };
    }
    if (eventPayload.assignees?.length) {
      return {
        isNewAssignment: true,
      };
    }
  }

  private isNewObject(eventPayload: GitLabIssueEvent) {
    return !!eventPayload.changes.id;
  }

  private isIssueClosed(eventPayload: GitLabIssueEvent): boolean {
    const stateId = eventPayload.changes.state_id;
    return !!(stateId && stateId.current === 2);
  }

  private isIssueReopened(eventPayload: GitLabIssueEvent): boolean {
    const stateId = eventPayload.changes.state_id;
    return !!(stateId && !eventPayload.changes.created_at);
  }

  private parseChanges(eventPayload: GitLabIssueEvent) {
    const changes: IssueChanges = {};
    if (this.isNewObject(eventPayload)) {
      changes.isNewObject = this.isNewCreatedIssueWithChanges(eventPayload);
      return changes;
    }
    if (eventPayload.changes.assignees) {
      this.parseChangesForAssignees(eventPayload, changes);
    }
    if (this.isIssueClosed(eventPayload)) {
      changes.isClosed = true;
      return changes;
    } else if (this.isIssueReopened(eventPayload)) {
      changes.isReopened = true;
      return changes;
    }
    if (eventPayload.changes.due_date) {
      const dueDateChange = this.parseChangesForDueDate(eventPayload.changes.due_date);
      if (dueDateChange.isUpdated) {
        changes.isDueDateUpdated = {
          due_date: dueDateChange.due_date!,
        };
        return changes;
      }
      if (dueDateChange.isAdded) {
        changes.isDueDateAdded = {
          due_date: dueDateChange.due_date!,
        };
        return changes;
      }
      changes.isDueDateDeleted = true;
      return changes;
    }
    if (eventPayload.changes.description) {
      changes.isDescriptionChanged = true;
    }
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
    }
    if (eventPayload.changes.labels) {
      // TODO: Порефакторить этот блок и метод parseChangesForAssignees.
      // TODO: А вообще сократить количество атрибутов до 1, а не 2 или 3-х что в labels, что в assignees
      const currentLabels = [...eventPayload.changes.labels.current];
      const previousLabels = [...eventPayload.changes.labels.previous];
      const labelChanges = this.parseChangesForLists<Label>(currentLabels, previousLabels)!;
      if (labelChanges.added && labelChanges.deleted) {
        changes.isLabelsAddedAndDeleted = {
          addedLabels: labelChanges.added.map((label) => label.title),
          deletedLabels: labelChanges.deleted.map((label) => label.title),
        };
        return changes;
      }
      if (labelChanges.deleted && !labelChanges.added) {
        changes.isLabelsDeleted = {
          labels: labelChanges.deleted.map((label) => label.title),
        };
        return changes;
      }
      changes.isLabelsAdded = {
        labels: labelChanges.added.map((label) => label.title),
      };
      return changes;
    }
    return changes;
  }

  private parseChangesForAssignees(eventPayload: GitLabIssueEvent, changes: IssueChanges) {
    const currentAssignees = [...eventPayload.changes.assignees!.current];
    const previousAssignees = [...eventPayload.changes.assignees!.previous];
    const assigneesChanges = this.parseChangesForLists<User>(currentAssignees, previousAssignees);
    const reduceAssignees = (assignee: User) => ({
      id: String(assignee.id),
      name: assignee.name,
    });
    if (assigneesChanges.added && assigneesChanges.deleted) {
      changes.isAssigneesAddedAndDeleted = {
        added: assigneesChanges.added.map(reduceAssignees),
        deleted: assigneesChanges.deleted.map(reduceAssignees),
      };
    }
    if (assigneesChanges.deleted && !assigneesChanges.added) {
      changes.isAssigneesDeleted = {
        deleted: assigneesChanges.deleted.map(reduceAssignees),
      };
    }
    if (!assigneesChanges.deleted && assigneesChanges.added) {
      changes.isAssigneesAdded = {
        added: assigneesChanges.added.map(reduceAssignees),
      };
    }
  }

  private parseChangesForDueDate(dueDate: NonNullable<GitLabIssueEvent['changes']['due_date']>) {
    const isDueDateUpdated = !!dueDate.current && !!dueDate.previous;
    const isDueDateAdded = !!dueDate.current && !dueDate.previous;
    if (isDueDateUpdated) {
      return {
        isUpdated: true,
        due_date: dueDate.current,
      };
    }
    if (isDueDateAdded) {
      return {
        isAdded: true,
        due_date: dueDate.current,
      };
    }
    return {
      isDeleted: true,
    };
  }

  private parseChangesForLists<T extends Label | User>(currentList: T[], previousList: T[]) {
    if (currentList.length) {
      currentList.sort((a, b) => a.id - b.id);
    }
    const [addedEntities, deletedEntities] = this.performBinarySearchInLists(currentList, previousList);
    const isEntitiesAddedAndDeleted = !!addedEntities.length && !!deletedEntities.length;
    const isEntitiesOnlyDeleted = !addedEntities.length && !!deletedEntities.length;

    if (isEntitiesAddedAndDeleted) {
      return {
        added: addedEntities,
        deleted: deletedEntities,
      };
    }
    if (isEntitiesOnlyDeleted) {
      return {
        deleted: deletedEntities,
      };
    }
    return {
      added: addedEntities,
    };
  }

  private performBinarySearchInLists<T extends Label | User>(currentSortedList: T[], previousList: T[]) {
    const addedEntities: T[] = [...currentSortedList];
    const deletedEntities: T[] = [];

    while (previousList.length) {
      const element = previousList.pop()!;

      let left = 0;
      let right = currentSortedList.length - 1;
      let isChanged = false;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (currentSortedList[mid].id === element.id) {
          addedEntities.splice(mid, 1);
          isChanged = true;
        }

        if (currentSortedList[mid].id < element.id) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      if (!isChanged) {
        deletedEntities.push(element);
      }
    }
    return [addedEntities, deletedEntities];
  }
}
