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
      const isThereChangesForLabels = assigneeChange?.startsWith('label');
      if (isThereChangesForLabels) {
        const message = this.composeStringForLabelChanges(assigneeChange);
        preparedCommonMessage.push(message);
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
      const isThereChangesForLabels = assigneeChange?.startsWith('label');
      if (isThereChangesForLabels) {
        const message = this.composeStringForLabelChanges(assigneeChange);
        preparedCommonMessage.push(message);
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
      const isThereChangesForLabels = assigneeChange?.startsWith('label');
      if (isThereChangesForLabels) {
        const message = this.composeStringForLabelChanges(assigneeChange);
        preparedCommonMessage.push(message);
      }
    }
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeStringForLabelChanges(labelChanges: string) {
    const preparedMessageForLabelChanges: string[] = [];
    if (labelChanges.startsWith('label:added')) {
      const labelText = labelChanges.match(/(?<=\()[^\)]*(?=\))/g);
      if (labelText && labelText.length === 1) {
        const label = labelText.pop();
        preparedMessageForLabelChanges.push(`добавился лейбл ${label}.`);
      } else if (labelText) {
        let endOfText = 'добавились лейблы ';
        labelText.forEach((label) => {
          endOfText += `${label}, `;
        });
        endOfText = endOfText.replace(/,\s$/, '.');
        preparedMessageForLabelChanges.push(endOfText);
      }
    }
    if (labelChanges.startsWith('label:deleted')) {
      const labelText = labelChanges.match(/(?<=\()[^\)]*(?=\))/g);
      if (labelText && labelText.length === 1) {
        const label = labelText.pop();
        preparedMessageForLabelChanges.push(`удалился лейбл ${label}.`);
      } else if (labelText) {
        let endOfText = 'удалились лейблы ';
        labelText.forEach((label) => {
          endOfText += `${label}, `;
        });
        endOfText = endOfText.replace(/,\s$/, '.');
        preparedMessageForLabelChanges.push(endOfText);
      }
    }
    if (labelChanges.startsWith('label:both')) {
      let endOfText = '';
      const addedLabels = labelChanges.match(/(?<=:added).*(?=:deleted)/)?.shift();
      const addedLabelsText = addedLabels?.match(/(?<=\()[^\)]*(?=\))/g);
      const deletedLabels = labelChanges.match(/(?<=:deleted).*/)?.shift();
      const deletedLabelsText = deletedLabels?.match(/(?<=\()[^\)]*(?=\))/g);

      if (addedLabelsText && addedLabelsText.length === 1) {
        endOfText += 'добавился лейбл ';
        addedLabelsText.forEach((label) => (endOfText += `${label} `));
      } else if (addedLabelsText) {
        endOfText += 'добавились лейблы ';
        addedLabelsText.forEach((label) => (endOfText += `${label}, `));
      }
      if (deletedLabelsText && deletedLabelsText.length === 1) {
        endOfText += 'и удалился лейбл ';
        deletedLabelsText.forEach((label) => (endOfText += `${label}.`));
      } else if (deletedLabelsText) {
        endOfText += 'и удалились лейблы ';
        deletedLabelsText.forEach((label) => (endOfText += `${label}, `));
        endOfText = endOfText.replace(/,\s$/, '.');
      }

      preparedMessageForLabelChanges.push(endOfText);
    }

    return preparedMessageForLabelChanges.join('');
  }
}
