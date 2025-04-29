import { DataParser, EventChanges, EventPayload, ParseChangesData } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly objectType = ObjectTypes.ISSUE;

  parseEventMembersIds(serviceType: EventPayload<GitLabIssueEvent>) {
    const objectMembersIds: number[] = [];
    objectMembersIds.push(serviceType.eventPayload.object_attributes.author_id);
    serviceType.eventPayload.object_attributes.assignee_ids.forEach((assigneeId) => objectMembersIds.push(assigneeId));
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
    const commonChanges = {
      changes: this.parseCommonChanges(eventPayload),
      objectType: this.objectType,
      objectUrl: eventPayload.object_attributes.url,
      objectId: String(eventPayload.object_attributes.id),
      projectUrl: eventPayload.project.web_url,
      projectName: eventPayload.project.name,
      isCommon: true,
    };
    const individualChanges = eventMembersIds.reduce<EventChanges[]>((acc, memberId) => {
      const isAssignee = eventPayload.assignees?.some((assignee) => assignee.id === memberId);
      if (isAssignee) {
        const assigneeChanges = this.parseChangesForAssigneeOrAuthor(eventPayload);
        if (assigneeChanges.length) {
          acc.push({
            serviceUserId: String(memberId),
            objectType: this.objectType,
            objectUrl: eventPayload.object_attributes.url,
            objectId: String(eventPayload.object_attributes.id),
            projectUrl: eventPayload.project.web_url,
            projectName: eventPayload.project.name,
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
            serviceUserId: String(memberId),
            objectType: this.objectType,
            objectUrl: eventPayload.object_attributes.url,
            objectId: String(eventPayload.object_attributes.id),
            projectUrl: eventPayload.project.web_url,
            projectName: eventPayload.project.name,
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

  private parseCommonChanges(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
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
    return changes;
  }

  private parseChangesForAssigneeOrAuthor(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
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
}
