import { GitRemoteHandler, ServiceType } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes } from '../../constants/enums';

export default class IssueHookHandler implements GitRemoteHandler<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;

  parseRecipients(serviceType: ServiceType<GitLabIssueEvent>): string[] {
    const recipients: string[] = [];
    if (!serviceType.eventPayload.assignees) {
      return recipients;
    }
    for (const assignee of serviceType.eventPayload.assignees) {
      if (assignee.username !== serviceType.eventPayload.user.username) {
        recipients.push(serviceType.eventPayload.user.username);
      }
    }
    return recipients;
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
        }
        case 'assignees': {
          notificationStrings.push(`Изменился Assignee у Issue\n`);
        }
      }
    }

    return notificationStrings.join('');
  }
}
