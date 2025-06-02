import { DataForParsingChanges, DataParser, EventChanges, EventPayload, IssueChanges } from '../../types';
import { GitLabIssueEvent, Label } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

type ChangesForIssue = EventChanges<ObjectTypes.ISSUE>;

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly objectType = ObjectTypes.ISSUE as const;

  parseProjectInfo(eventPayload: EventPayload<GitLabIssueEvent>) {
    return {
      instanceId: eventPayload.name,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabIssueEvent>) {
    return {
      instanceId: eventPayload.name,
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
    const commonChanges = {
      ...eventChangesTemplate,
      changes: this.parseChanges(eventPayload),
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<ChangesForIssue[]>((acc, memberId) => {
      // TODO: Добавить changes для бывшего Assignee. Например, "С вас сняли задачу"
      const isAssignee = eventPayload.assignees?.some((assignee) => assignee.id === memberId);
      if (isAssignee) {
        const assigneeChanges = this.parseChanges(eventPayload);
        if (assigneeChanges.haveChanges) {
          acc.push({
            ...eventChangesTemplate,
            instanceUserId: String(memberId),
            isCommon: false,
            changes: {
              ...assigneeChanges,
              forAssignee: true,
            },
          });
          return acc;
        }
      }
      const isAuthor = eventPayload.object_attributes.author_id === memberId;
      if (isAuthor) {
        const authorChanges = this.parseChanges(eventPayload);
        if (authorChanges.haveChanges) {
          acc.push({
            ...eventChangesTemplate,
            instanceUserId: String(memberId),
            isCommon: false,
            changes: {
              ...authorChanges,
              forAuthor: true,
            },
          });
          return acc;
        }
      }
      return acc;
    }, []);
    return [...individualChanges, commonChanges];
  }

  private isNewAssignmentWithDeadline(eventPayload: GitLabIssueEvent) {
    if (eventPayload.assignees?.length && eventPayload.changes.due_date && eventPayload.changes.due_date.current) {
      return {
        deadline: eventPayload.changes.due_date.current,
      };
    }
    return false;
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
    const changes: IssueChanges = {
      isNewObject: this.isNewObject(eventPayload),
      haveChanges: false,
    };
    const isNewAssignmentWithDeadline = this.isNewAssignmentWithDeadline(eventPayload);
    if (changes.isNewObject && isNewAssignmentWithDeadline) {
      changes.isNewAssignmentWithDeadline = isNewAssignmentWithDeadline;
      changes.haveChanges = true;
      return changes;
    } else if (changes.isNewObject && eventPayload.assignees?.length) {
      changes.isNewAssignment = true;
      changes.haveChanges = true;
      return changes;
    }
    if (eventPayload.changes.assignees) {
      changes.isNewAssignment = true;
      changes.haveChanges = true;
    }
    if (this.isIssueClosed(eventPayload)) {
      changes.isClosed = true;
      changes.haveChanges = true;
      return changes;
    } else if (this.isIssueReopened(eventPayload)) {
      changes.isReopened = true;
      changes.haveChanges = true;
      return changes;
    }
    if (eventPayload.changes.due_date) {
      const dueDateChange = this.parseChangesForDueDate(eventPayload.changes.due_date);
      if (dueDateChange.isUpdated) {
        changes.isDueDateUpdated = {
          due_date: dueDateChange.due_date!,
        };
        changes.haveChanges = true;
        return changes;
      }
      if (dueDateChange.isAdded) {
        changes.isDueDateAdded = {
          due_date: dueDateChange.due_date!,
        };
        changes.haveChanges = true;
        return changes;
      }
      changes.isDueDateDeleted = true;
      changes.haveChanges = true;
      return changes;
    }
    if (eventPayload.changes.description) {
      changes.isDescriptionChanged = true;
      changes.haveChanges = true;
    }
    if (eventPayload.changes.title) {
      changes.isTitleChanged = true;
      changes.haveChanges = true;
    }
    if (eventPayload.changes.labels) {
      const currentLabels = [...eventPayload.changes.labels.current];
      const previousLabels = [...eventPayload.changes.labels.previous];
      const labelChanges = this.parseChangesForLabels(currentLabels, previousLabels)!;
      if (labelChanges.addedLabels && labelChanges.deletedLabels) {
        changes.isLabelsAddedAndDeleted = labelChanges;
        changes.haveChanges = true;
        return changes;
      }
      if (labelChanges.deletedLabels && !labelChanges.addedLabels) {
        changes.isLabelsDeleted = {
          labels: labelChanges.deletedLabels,
        };
        changes.haveChanges = true;
        return changes;
      }
      changes.isLabelsAdded = {
        labels: labelChanges.addedLabels,
      };
      changes.haveChanges = true;
      return changes;
    }
    return changes;
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

  private parseChangesForLabels(currentLabels: Label[], previousLabels: Label[]) {
    if (currentLabels.length) {
      currentLabels.sort((a, b) => a.id - b.id);
    }
    const [addedLabels, deletedLabels] = this.performBinarySearchInLabelChanges(currentLabels, previousLabels);
    const isLabelsAddedAndDeleted = !!addedLabels.length && !!deletedLabels.length;
    const isLabelsOnlyDeleted = !addedLabels.length && !!deletedLabels.length;

    if (isLabelsAddedAndDeleted) {
      return {
        addedLabels: addedLabels.map((label) => label.title),
        deletedLabels: deletedLabels.map((label) => label.title),
      };
    }
    if (isLabelsOnlyDeleted) {
      return {
        deletedLabels: deletedLabels.map((label) => label.title),
      };
    }
    return {
      addedLabels: addedLabels.map((label) => label.title),
    };
  }

  private performBinarySearchInLabelChanges(currentSortedLabels: Label[], previousLabels: Label[]) {
    const addedLabels: Label[] = [...currentSortedLabels];
    const deletedLabels: Label[] = [];

    while (previousLabels.length) {
      const element = previousLabels.pop()!;

      let left = 0;
      let right = currentSortedLabels.length - 1;
      let isChanged = false;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (currentSortedLabels[mid].id === element.id) {
          addedLabels.splice(mid, 1);
          isChanged = true;
        }

        if (currentSortedLabels[mid].id < element.id) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      if (!isChanged) {
        deletedLabels.push(element);
      }
    }
    return [addedLabels, deletedLabels];
  }
}
