import { Injectable, Logger } from '@nestjs/common';
import { EventChanges, NotificationMessage } from '../../types';
import { ObjectTypes } from '../../constants/enums';

@Injectable()
export class NotificationComposerService {
  constructor(private readonly logger: Logger) {}

  composeNotification(changes: EventChanges[]): NotificationMessage[] | null {
    const individualChanges = changes.filter((change) => change.serviceUserId);
    const commonChanges = changes.find((change) => change.isCommon);
    if (commonChanges) {
      this.logger.error(
        'There is no common changes described for Notification Composer. Check the parse event changes method for proper logic',
      );
      return null;
    }
    const notificationMessages: NotificationMessage[] = [];
    for (const change of individualChanges) {
      if (change.isAssignee && change.objectType === ObjectTypes.ISSUE) {
        notificationMessages.push({
          serviceUserId: change.serviceUserId,
          message: this.composeMessageForIssueAssignee(change),
        });
      }
    }
  }

  private composeMessageForIssueAssignee(change: EventChanges): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В Вашем <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> `,
    );
    for (const assigneeChange of change.changes) {
      switch (assigneeChange) {
        case 'new-assignment': {
          return `На Вас назначали новое <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a>`;
        }
        case 'closed': {
          return `Ваша <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> закрыта`;
        }
        case 'reopened': {
          return `Ваша <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> <b>снова открыта</b>`;
        }
        case 'description:changed': {
          preparedCommonMessage.push('изменилось описание, ');
          break;
        }
        case 'title:changed': {
          preparedCommonMessage.push('изменился заголовок, ');
        }
      }
    }
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }
}
