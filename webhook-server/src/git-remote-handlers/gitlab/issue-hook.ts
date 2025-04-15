import { GitRemoteHandler, ServiceType } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes } from '../../constants/enums';

export default class IssueHookHandler implements GitRemoteHandler<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;

  parseRecipients(serviceType: ServiceType<GitLabIssueEvent>): string[] {
    const recipients: string[] = [];
    for (const assignee of serviceType.eventPayload.assignees) {
      if (assignee.username !== serviceType.eventPayload.user.username) {
        recipients.push(serviceType.eventPayload.user.username);
      }
    }
    return recipients;
  }
  composeNotification(serviceType: ServiceType<GitLabIssueEvent>): string {
    return `Issue Hook test notification from: ${serviceType.eventPayload.user.username}`;
  }
}
