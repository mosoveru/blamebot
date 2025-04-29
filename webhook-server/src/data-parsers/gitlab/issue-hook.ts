import { DataParser, EventPayload, ParseChangesData } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;

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

  parseEventChanges({ eventMembersId, eventPayload }: ParseChangesData<GitLabIssueEvent>) {
    const commonChanges = this.parseCommonChanges(eventPayload);
    return eventMembersId.map((memberId) => {
      const isAssignee = eventPayload.assignees?.some((assignee) => assignee.id === memberId);
      if (isAssignee) {
        const assigneeChanges = this.parseChangesForAssigneeOrAuthor(eventPayload, 'assignee');
        if (assigneeChanges.length) {
          return {
            serviceUserId: String(memberId),
            changes: assigneeChanges,
          };
        }
      }
      const isAuthor = eventPayload.object_attributes.author_id === memberId;
      if (isAuthor) {
        const authorChanges = this.parseChangesForAssigneeOrAuthor(eventPayload, 'author');
        if (authorChanges.length) {
          return {
            serviceUserId: String(memberId),
            changes: authorChanges,
          };
        }
      }
      return {
        serviceUserId: String(memberId),
        changes: commonChanges,
      };
    });
  }

  private parseCommonChanges(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
    for (const change of payloadChanges) {
      switch (change) {
        case 'assignees': {
          changes.push(`common:issue:new-assignment`);
          break;
        }
        case 'state_id': {
          const stateId = eventPayload.changes.state_id?.current;
          if (stateId === 2) {
            changes.push(`common:issue:closed`);
            return changes;
          } else if (!payloadChanges.includes('created_at')) {
            changes.push(`common:issue:reopened`);
            return changes;
          }
          break;
        }
        case 'description': {
          changes.push(`common:description:changed`);
          break;
        }
        case 'title': {
          changes.push(`common:title:changed`);
          break;
        }
      }
    }
    return changes;
  }

  private parseChangesForAssigneeOrAuthor(eventPayload: GitLabIssueEvent, memberType: 'assignee' | 'author') {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
    if (payloadChanges.includes('assignees')) {
      changes.push(`${memberType}:issue:new-assignment`);
      return changes;
    }
    if (payloadChanges.includes('state_id')) {
      const stateId = eventPayload.changes.state_id?.current;
      if (stateId === 2) {
        changes.push(`${memberType}:issue:closed`);
        return changes;
      } else if (!payloadChanges.includes('created_at')) {
        changes.push(`${memberType}:issue:reopened`);
        return changes;
      }
    }
    for (const change of Object.keys(eventPayload.changes)) {
      switch (change) {
        case 'description': {
          changes.push(`${memberType}:description:changed`);
          break;
        }
        case 'title': {
          changes.push(`${memberType}:title:changed`);
          break;
        }
      }
    }
    return changes;
  }
}
