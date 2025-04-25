import { DataParser, EventPayload } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes, RemoteGitServices } from '../../constants/enums';

export class IssueHookDataParser implements DataParser<GitLabIssueEvent> {
  readonly eventType: GitLabEventTypes.ISSUE;
  readonly gitProvider: RemoteGitServices.GITLAB;

  parseEventMembersIds(serviceType: EventPayload<GitLabIssueEvent>) {
    const objectMembersIds: number[] = [];
    objectMembersIds.push(serviceType.eventPayload.object_attributes.author_id);
    serviceType.eventPayload.object_attributes.assignee_ids.forEach((assigneeId) => objectMembersIds.push(assigneeId));
    return objectMembersIds;
  }

  parseObservableObjectInfo(serviceType: EventPayload<GitLabIssueEvent>) {
    return {
      objectId: String(serviceType.eventPayload.object_attributes.id),
      projectId: String(serviceType.eventPayload.project.id),
      objectType: ObjectTypes.ISSUE,
      objectUrl: serviceType.eventPayload.object_attributes.url,
    };
  }

  parseEventInitiatorId(serviceType: EventPayload<GitLabIssueEvent>): string {
    return String(serviceType.eventPayload.user.id);
  }
}
