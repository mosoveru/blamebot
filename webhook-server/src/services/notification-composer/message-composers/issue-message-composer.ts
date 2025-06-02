import { ObjectTypes } from '../../../constants/enums';
import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';

type ChangesForIssue = EventChanges<IssueMessageComposer['meantFor']>;

export class IssueMessageComposer implements MessageComposer {
  readonly meantFor = ObjectTypes.ISSUE;

  composeMessage(changes: ChangesForIssue[]): NotificationMessage[] {
    const individualChanges = changes.filter((change) => change.instanceUserId);
    const commonChanges = changes.find((change) => change.isCommon)!;
    const notificationMessages: NotificationMessage[] = [];
    for (const eventChanges of individualChanges) {
      if (eventChanges.changes.forAssignee) {
        notificationMessages.push({
          instanceUserId: eventChanges.instanceUserId,
          message: this.composeMessageForIssueAssignee(eventChanges),
        });
      }
      if (eventChanges.changes.forAuthor) {
        notificationMessages.push({
          instanceUserId: eventChanges.instanceUserId,
          message: this.composeMessageForIssueAuthor(eventChanges),
        });
      }
    }
    notificationMessages.push({
      message: this.composeCommonMessageForIssue(commonChanges),
    });
    return notificationMessages;
  }

  private composeMessageForIssueAssignee(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В Вашем <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> `,
    );
    if (eventChanges.changes.isNewAssignment) {
      return `На Вас назначали новое <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открыта</b>`;
    }
    if (eventChanges.changes.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewAssignmentWithDeadline.deadline;
      return `На Вас назначали новое <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> с дедлайном до <b>${date}</b>`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeMessageForIssueAuthor(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В Вашем <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> `,
    );
    if (eventChanges.changes.isNewAssignment) {
      return `В Вашем <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> сменился исполнитель`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открыта</b>`;
    }
    if (eventChanges.changes.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewAssignmentWithDeadline.deadline;
      return `В Вашем <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> сменился исполнитель и назначен дедлайн до <b>${date}</b>`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeCommonMessageForIssue(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    preparedCommonMessage.push(
      `В связанном с Вами <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> `,
    );
    if (eventChanges.changes.isNewAssignment) {
      preparedCommonMessage.push(`сменился исполнитель, `);
    }
    if (eventChanges.changes.isClosed) {
      return `Связанное с Вами <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрылось`;
    }
    if (eventChanges.changes.isReopened) {
      return `Связанное с Вами <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открылось</b>`;
    }
    if (eventChanges.changes.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewAssignmentWithDeadline.deadline;
      preparedCommonMessage.push(`сменился исполнитель, добавился дедлайн до <b>${date}</b>, `);
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private listMinorChanges(eventChanges: ChangesForIssue, preparedCommonMessage: string[]) {
    if (eventChanges.changes.isDescriptionChanged) {
      preparedCommonMessage.push('изменилось описание, ');
    }
    if (eventChanges.changes.isTitleChanged) {
      preparedCommonMessage.push('изменился заголовок, ');
    }
    if (eventChanges.changes.isLabelsAddedAndDeleted) {
      const addedLabels = eventChanges.changes.isLabelsAddedAndDeleted.addedLabels;
      const deletedLabels = eventChanges.changes.isLabelsAddedAndDeleted.deletedLabels;
      const sentence = this.composeStringForLabelChanges(addedLabels, deletedLabels);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isLabelsAdded) {
      const addedLabels = eventChanges.changes.isLabelsAdded.labels;
      const sentence = this.composeStringForLabelChanges(addedLabels);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isLabelsDeleted) {
      const deletedLabels = eventChanges.changes.isLabelsDeleted.labels;
      const sentence = this.composeStringForLabelChanges(undefined, deletedLabels);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isDueDateAdded) {
      const date = eventChanges.changes.isDueDateAdded.due_date;
      const sentence = this.composeStringForDueDateChanges('added', date);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isDueDateUpdated) {
      const date = eventChanges.changes.isDueDateUpdated.due_date;
      const sentence = this.composeStringForDueDateChanges('updated', date);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isDueDateDeleted) {
      const sentence = this.composeStringForDueDateChanges('deleted');
      preparedCommonMessage.push(sentence);
    }
  }

  private composeStringForDueDateChanges(type: 'updated' | 'added' | 'deleted', date?: string) {
    if (type === 'updated') {
      return `обновился дедлайн до <b>${date}</b>, `;
    } else if (type === 'added') {
      return `добавился дедлайн до <b>${date}</b>, `;
    } else {
      return `удалился дедлайн, `;
    }
  }

  private composeStringForLabelChanges(addedLabels?: string[], deletedLabels?: string[]) {
    let endOfText = '';
    if (addedLabels && addedLabels.length === 1) {
      endOfText += 'добавился лейбл ';
      addedLabels.forEach((label) => (endOfText += `${label} `));
    } else if (addedLabels) {
      endOfText += 'добавились лейблы ';
      addedLabels.forEach((label) => (endOfText += `${label}, `));
    }
    if (deletedLabels && deletedLabels.length === 1) {
      endOfText += 'и удалился лейбл ';
      deletedLabels.forEach((label) => (endOfText += `${label}.`));
    } else if (deletedLabels) {
      endOfText += 'и удалились лейблы ';
      deletedLabels.forEach((label) => (endOfText += `${label}, `));
      endOfText = endOfText.replace(/(,\s|\s)$/, '.');
    }

    return endOfText;
  }
}
