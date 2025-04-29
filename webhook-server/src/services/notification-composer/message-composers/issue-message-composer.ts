import { ObjectTypes } from '../../../constants/enums';
import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';

export class IssueMessageComposer implements MessageComposer {
  readonly meantFor = ObjectTypes.ISSUE;

  composeMessage(changes: EventChanges[]): NotificationMessage[] {
    const individualChanges = changes.filter((change) => change.serviceUserId);
    const commonChanges = changes.find((change) => change.isCommon)!;
    const notificationMessages: NotificationMessage[] = [];
    for (const change of individualChanges) {
      if (change.isAssignee && change.objectType === ObjectTypes.ISSUE) {
        notificationMessages.push({
          serviceUserId: change.serviceUserId,
          message: this.composeMessageForIssueAssignee(change),
        });
      }
      if (change.isAuthor && change.objectType === ObjectTypes.ISSUE) {
        notificationMessages.push({
          serviceUserId: change.serviceUserId,
          message: this.composeMessageForIssueAuthor(change),
        });
      }
    }
    notificationMessages.push({
      message: this.composeCommonMessageForIssue(commonChanges),
    });
    return notificationMessages;
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

  private composeMessageForIssueAuthor(change: EventChanges): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В Вашем <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> `,
    );
    for (const assigneeChange of change.changes) {
      switch (assigneeChange) {
        case 'new-assignment': {
          return `В Вашем <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> сменился исполнитель`;
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

  private composeCommonMessageForIssue(change: EventChanges): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В связанном с Вами <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> `,
    );
    for (const assigneeChange of change.changes) {
      switch (assigneeChange) {
        case 'new-assignment': {
          preparedCommonMessage.push(`сменился исполнитель, `);
          break;
        }
        case 'closed': {
          return `Связанное с Вами <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> закрылось`;
        }
        case 'reopened': {
          return `Связанное с Вами <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> <b>снова открылось</b>`;
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
