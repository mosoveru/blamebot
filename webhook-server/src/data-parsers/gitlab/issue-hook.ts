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
    return eventMembersId.map((memberId) => {
      const isAssignee = eventPayload.assignees?.some((assignee) => assignee.id === memberId);
      if (isAssignee) {
        const assigneeChanges = this.parseChangesForAssignee(eventPayload);
        if (assigneeChanges.length) {
          return {
            serviceUserId: memberId,
            changes: assigneeChanges,
          };
        }
        for (const change of Object.keys(eventPayload.changes)) {
          switch (change) {
            case 'description': {
              assigneeChanges.push('description:changed');
              break;
            }
            case 'title': {
              assigneeChanges.push('title:changed');
              break;
            }
          }
        }
        return { serviceUserId: memberId, changes: ['issue:assigned'] };
      }
    });

    // TODO: Реализовать common change parser.
  }

  private parseChangesForAssignee(eventPayload: GitLabIssueEvent) {
    const changes: string[] = [];
    const payloadChanges = Object.keys(eventPayload.changes);
    if (payloadChanges.includes('assignees')) {
      changes.push('issue:assigned');
    }
    if (payloadChanges.includes('state_id')) {
      const stateId = eventPayload.changes.state_id?.current;
      if (stateId === 2) {
        changes.push('issue:closed');
      } else if (payloadChanges.includes('created_at')) {
        changes.push('issue:reopened');
      }
    }
    return changes;
  }
}
