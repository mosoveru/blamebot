import { EventInfo, GitRemoteHandler, EventPayload } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, ObjectTypes } from '../../constants/enums';

export default class IssueHookHandler implements GitRemoteHandler<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;

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

  composeNotification(eventInfo: EventInfo<GitLabIssueEvent>): string {
    const notificationStrings: string[] = [];

    notificationStrings.push(`<b>${eventInfo.name}</b>\n\n`);
    notificationStrings.push(
      `В связанном с вами Issue <a href="${eventInfo.eventPayload.object_attributes.url}">#${eventInfo.eventPayload.object_attributes.id}</a>`,
    );
    notificationStrings.push(
      ` в репозитории <a href="${eventInfo.eventPayload.project.web_url}">${eventInfo.eventPayload.repository.name}</a> произошли изменения:\n\n`,
    );

    for (const changeType of Object.keys(eventInfo.eventPayload.changes)) {
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
