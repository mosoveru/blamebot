import { GitRemoteHandler, ServiceType } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes } from '../../constants/enums';

export default class IssueHookHandler implements GitRemoteHandler<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;

  parseEventMembersIds(serviceType: ServiceType<GitLabIssueEvent>) {
    const objectMembersIds: number[] = [];
    objectMembersIds.push(serviceType.eventPayload.object_attributes.author_id);
    serviceType.eventPayload.object_attributes.assignee_ids.forEach((assigneeId) => objectMembersIds.push(assigneeId));
    return objectMembersIds;
  }

  parseObservableObjectInfo(serviceType: ServiceType<GitLabIssueEvent>) {
    return {
      objectId: String(serviceType.eventPayload.object_attributes.id),
      projectId: String(serviceType.eventPayload.project.id),
      objectType: ObjectTypes.ISSUE,
      objectUrl: serviceType.eventPayload.object_attributes.url,
    };
  }

  composeNotification(serviceType: ServiceType<GitLabIssueEvent>): string {
    const notificationStrings: string[] = [];

    notificationStrings.push(
      `В связанном с вами Issue #${serviceType.eventPayload.object_attributes.id} в репозитории ${serviceType.eventPayload.repository.name} произошли изменения:\n\n`,
    );

    for (const changeType of Object.keys(serviceType.eventPayload.changes)) {
      switch (changeType) {
        case 'description': {
          notificationStrings.push(`Изменилось описание\n`);
          break;
        }
        case 'title': {
          notificationStrings.push(`Изменился заголовок\n`);
          break;
        }
        case 'assignees': {
          notificationStrings.push(`Изменился Assignee у Issue\n`);
          break;
        }
      }
    }

    return notificationStrings.join('');
  }
}
