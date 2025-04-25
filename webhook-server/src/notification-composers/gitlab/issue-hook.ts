import { EventInfo, NotificationComposer } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, RemoteGitServices } from '../../constants/enums';

export default class IssueHookNotificationComposer implements NotificationComposer<GitLabIssueEvent> {
  readonly eventType = GitLabEventTypes.ISSUE;
  readonly gitProvider = RemoteGitServices.GITLAB;

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
