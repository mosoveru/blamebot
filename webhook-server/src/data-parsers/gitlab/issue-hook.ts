import { DataParser, EventChanges, EventPayload, ParseChangesData } from '../../types';
import { GitLabIssueEvent, Label } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly objectType = ObjectTypes.ISSUE;

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

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabIssueEvent>) {
    return {
      serviceId: eventPayload.name,
      objectId: String(eventPayload.eventPayload.object_attributes.id),
      projectId: String(eventPayload.eventPayload.project.id),
      objectType: ObjectTypes.ISSUE,
      objectUrl: eventPayload.eventPayload.object_attributes.url,
    };
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabIssueEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }

  parseEventChanges({ eventMembersIds, eventPayload }: ParseChangesData<GitLabIssueEvent>) {
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
      changes: this.parseCommonChanges(eventPayload),
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<EventChanges[]>((acc, memberId) => {
      // TODO: Добавить changes для бывшего Assignee. Например, "С вас сняли задачу"
      const isAssignee = eventPayload.assignees?.some((assignee) => assignee.id === memberId);
      if (isAssignee) {
        const assigneeChanges = this.parseChangesForAssigneeOrAuthor(eventPayload);
        if (assigneeChanges.length) {
          acc.push({
            ...eventChangesTemplate,
            serviceUserId: String(memberId),
            isAssignee: true,
            isCommon: false,
            changes: assigneeChanges,
          });
          return acc;
        }
      }
      const isAuthor = eventPayload.object_attributes.author_id === memberId;
      if (isAuthor) {
        const authorChanges = this.parseChangesForAssigneeOrAuthor(eventPayload);
        if (authorChanges.length) {
          acc.push({
            ...eventChangesTemplate,
            serviceUserId: String(memberId),
            isAuthor: true,
            isCommon: false,
            changes: authorChanges,
          });
          return acc;
        }
      }
      return acc;
    }, []);
    return [...individualChanges, commonChanges];
  }

  private parseNewAssignmentInNewObject(eventPayload: GitLabIssueEvent) {
    const payloadChanges = Object.keys(eventPayload.changes);
    if (eventPayload.assignees?.length) {
      if (payloadChanges.includes('due_date')) {
        return `new-assignment:deadline(${eventPayload.changes.due_date?.current})`;
      }
      return 'new-assignment';
    }
  }

  private isNewObject(eventPayload: GitLabIssueEvent) {
    const eventChanges = Object.keys(eventPayload.changes);
    return eventChanges.includes('id');
  }

  private parseCommonChanges(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
    if (this.isNewObject(eventPayload)) {
      const newObjectChanges = this.parseNewAssignmentInNewObject(eventPayload);
      if (newObjectChanges) {
        changes.push(newObjectChanges);
        return changes;
      }
    }
    for (const change of payloadChanges) {
      switch (change) {
        case 'assignees': {
          changes.push(`new-assignment`);
          break;
        }
        case 'state_id': {
          const stateId = eventPayload.changes.state_id?.current;
          if (stateId === 2) {
            changes.push(`closed`);
            return changes;
          } else if (!payloadChanges.includes('created_at')) {
            changes.push(`reopened`);
            return changes;
          }
          break;
        }
        case 'description': {
          changes.push(`description:changed`);
          break;
        }
        case 'title': {
          changes.push(`title:changed`);
          break;
        }
      }
    }
    if (payloadChanges.includes('labels')) {
      const currentLabels = [...eventPayload.changes.labels!.current];
      const previousLabels = [...eventPayload.changes.labels!.previous];
      const labelChanges = this.parseChangesForLabels(currentLabels, previousLabels)!;
      changes.push(labelChanges);
    }
    if (payloadChanges.includes('due_date')) {
      const dueDateChange = this.parseChangesForDueDate(eventPayload.changes.due_date!);
      changes.push(dueDateChange);
      return changes;
    }
    return changes;
  }

  private parseChangesForAssigneeOrAuthor(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
    if (this.isNewObject(eventPayload)) {
      const newObjectChanges = this.parseNewAssignmentInNewObject(eventPayload);
      if (newObjectChanges) {
        changes.push(newObjectChanges);
        return changes;
      }
    }
    if (payloadChanges.includes('assignees')) {
      changes.push(`new-assignment`);
      return changes;
    }
    if (payloadChanges.includes('state_id')) {
      const stateId = eventPayload.changes.state_id?.current;
      if (stateId === 2) {
        changes.push(`closed`);
        return changes;
      } else if (!payloadChanges.includes('created_at')) {
        changes.push(`reopened`);
        return changes;
      }
    }
    if (payloadChanges.includes('labels')) {
      const currentLabels = [...eventPayload.changes.labels!.current];
      const previousLabels = [...eventPayload.changes.labels!.previous];
      const labelChanges = this.parseChangesForLabels(currentLabels, previousLabels)!;
      changes.push(labelChanges);
    }
    if (payloadChanges.includes('due_date')) {
      const dueDateChange = this.parseChangesForDueDate(eventPayload.changes.due_date!);
      changes.push(dueDateChange);
      return changes;
    }
    for (const change of Object.keys(eventPayload.changes)) {
      switch (change) {
        case 'description': {
          changes.push(`description:changed`);
          break;
        }
        case 'title': {
          changes.push(`title:changed`);
          break;
        }
      }
    }
    return changes;
  }

  private parseChangesForDueDate(dueDate: NonNullable<GitLabIssueEvent['changes']['due_date']>) {
    const isDueDateUpdated = !!dueDate.current && !!dueDate.previous;
    const isDueDateAdded = !!dueDate.current && !dueDate.previous;
    if (isDueDateUpdated) {
      return `due_date:updated(${dueDate.current})`;
    }
    if (isDueDateAdded) {
      return `due_date:added(${dueDate.current})`;
    }
    return `due_date:deleted`;
  }

  private parseChangesForLabels(currentLabels: Label[], previousLabels: Label[]) {
    if (currentLabels.length) {
      currentLabels.sort((a, b) => a.id - b.id);
    }
    const [addedLabels, deletedLabels] = this.performBinarySearchInLabelChanges(currentLabels, previousLabels);
    const isLabelsAddedAndDeleted = !!addedLabels.length && !!deletedLabels.length;
    const isLabelsOnlyAdded = !!addedLabels.length && !deletedLabels.length;
    const isLabelsOnlyDeleted = !addedLabels.length && !!deletedLabels.length;

    if (isLabelsAddedAndDeleted) {
      let labelChanges = 'label:both:';
      labelChanges += 'added';
      addedLabels.forEach((label) => (labelChanges += `(${label.title})`));
      labelChanges += ':deleted';
      deletedLabels.forEach((label) => (labelChanges += `(${label.title})`));
      return labelChanges;
    }
    if (isLabelsOnlyDeleted) {
      let labelChanges = 'label:deleted';
      deletedLabels.forEach((label) => (labelChanges += `(${label.title})`));
      return labelChanges;
    }
    if (isLabelsOnlyAdded) {
      let labelChanges = 'label:added';
      addedLabels.forEach((label) => (labelChanges += `(${label.title})`));
      return labelChanges;
    }
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
