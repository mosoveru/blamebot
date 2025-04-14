import { GitRemoteHandler, GitWebhookServiceType } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';

export default class IssueHookHandler implements GitRemoteHandler<GitLabIssueEvent> {
  readonly eventType = 'Issue Hook';

  parseRecipients(serviceType: GitWebhookServiceType<GitLabIssueEvent>): string[] {
    if (serviceType.eventPayload.user.username === serviceType.eventPayload.assignee.username) {
      return null;
    }
    return [serviceType.eventPayload.assignee.username];
  }
  composeNotification(serviceType: GitWebhookServiceType<GitLabIssueEvent>): string {
    return `Issue Hook test notification from: ${serviceType.eventPayload.user.username}`;
  }
}
