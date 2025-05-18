import { ObjectTypes } from '../../../constants/enums';
import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';

export class IssueMessageComposer implements MessageComposer {
  readonly meantFor = ObjectTypes.ISSUE;

  composeMessage(changes: EventChanges[]): NotificationMessage[] {
    const individualChanges = changes.filter((change) => change.serviceUserId);
    const commonChanges = changes.find((change) => change.isCommon)!;
    const notificationMessages: NotificationMessage[] = [];
    for (const change of individualChanges) {
      if (change.isAssignee) {
        notificationMessages.push({
          serviceUserId: change.serviceUserId,
          message: this.composeMessageForIssueAssignee(change),
        });
      }
      if (change.isAuthor) {
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
      const isThereNewAssignmentWithDeadline = assigneeChange?.startsWith('new-assignment:deadline');
      if (isThereNewAssignmentWithDeadline) {
        const date = assigneeChange.match(/(?<=:deadline\()[^\)]*(?=\))/)?.shift();
        if (date) {
          return `На Вас назначали новое <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> с дедлайном до <b>${date}</b>`;
        } else {
          return `На Вас назначали новое <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> с дедлайном`;
        }
      }
      const isThereNewDueDate = assigneeChange?.startsWith('due_date');
      if (isThereNewDueDate) {
        const endOfText = this.composeStringForDueDateChanges(assigneeChange);
        preparedCommonMessage.push(endOfText);
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
      // TODO: Эти строки кода, видимо, никогда не будут выполнятся. Удалить в будущем
      const isThereNewAssignmentWithDeadline = assigneeChange?.startsWith('new-assignment:deadline');
      if (isThereNewAssignmentWithDeadline) {
        const date = assigneeChange.match(/(?<=:deadline\()[^\)]*(?=\))/)?.shift();
        if (date) {
          return `В Вашем <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> сменился исполнитель и назначен дедлайн до <b>${date}</b>`;
        } else {
          return `В Вашем <a href="${change.objectUrl}">Issue #${change.objectId}</a> в проекте <a href="${change.projectUrl}">${change.projectName}</a> сменился исполнитель и назначен дедлайн`;
        }
      }
      const isThereNewDueDate = assigneeChange?.startsWith('due_date');
      if (isThereNewDueDate) {
        const endOfText = this.composeStringForDueDateChanges(assigneeChange);
        preparedCommonMessage.push(endOfText);
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
      // TODO: Эти строки кода, видимо, никогда не будут выполнятся. Удалить в будущем
      const isThereNewAssignmentWithDeadline = assigneeChange?.startsWith('new-assignment:deadline');
      if (isThereNewAssignmentWithDeadline) {
        const date = assigneeChange.match(/(?<=:deadline\()[^\)]*(?=\))/)?.shift();
        if (date) {
          preparedCommonMessage.push(`сменился исполнитель, добавился дедлайн до <b>${date}</b>, `);
        } else {
          preparedCommonMessage.push(`сменился исполнитель, добавился дедлайн, `);
        }
      }
      const isThereNewDueDate = assigneeChange?.startsWith('due_date');
      if (isThereNewDueDate) {
        const endOfText = this.composeStringForDueDateChanges(assigneeChange);
        preparedCommonMessage.push(endOfText);
      }
    }
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeStringForDueDateChanges(dueDateChange: string) {
    const updated = dueDateChange.startsWith('due_date:updated');
    const added = dueDateChange.startsWith('due_date:added');

    if (updated) {
      const date = dueDateChange.match(/(?<=:updated\()[^\)]*(?=\))/)?.shift();
      return `обновился дедлайн до <b>${date}</b>, `;
    } else if (added) {
      const date = dueDateChange.match(/(?<=:added\()[^\)]*(?=\))/)?.shift();
      return `добавился дедлайн до <b>${date}</b>, `;
    } else {
      return `удалился дедлайн, `;
    }
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
