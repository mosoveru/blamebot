import { ObjectTypes } from '../../../constants/enums';
import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';

type ChangesForIssue = EventChanges<IssueMessageComposer['meantFor']>;
type UserInfo = {
  id: string;
  name: string;
};

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
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      return `На Вас назначали новое <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
    }
    if (eventChanges.changes.isUnassigned) {
      return `Вы перестали быть исполнителем в <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открыта</b>`;
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
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
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      return `В Вашем <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> сменился исполнитель`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открыта</b>`;
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
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
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      preparedCommonMessage.push(`сменился исполнитель, `);
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
      preparedCommonMessage.push(`сменился исполнитель, добавился дедлайн до <b>${date}</b>, `);
    }
    if (eventChanges.changes.isClosed) {
      return `Связанное с Вами <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> закрылось`;
    }
    if (eventChanges.changes.isReopened) {
      return `Связанное с Вами <a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a> <b>снова открылось</b>`;
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
    if (eventChanges.changes.isAssigneesChanges) {
      const newAssignees = eventChanges.changes.isAssigneesChanges.added;
      const deletedAssignees = eventChanges.changes.isAssigneesChanges.deleted;
      const sentence = this.composeStringForAssigneesChanges(newAssignees, deletedAssignees);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isLabelsChanged) {
      const addedLabels = eventChanges.changes.isLabelsChanged.added;
      const deletedLabels = eventChanges.changes.isLabelsChanged.deleted;
      const sentence = this.composeStringForLabelChanges(addedLabels, deletedLabels);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isDueDateChanged) {
      const dueDateChanges = eventChanges.changes.isDueDateChanged;
      if (dueDateChanges.isAdded) {
        const sentence = this.composeStringForDueDateChanges('added', dueDateChanges.isAdded.due_date);
        preparedCommonMessage.push(sentence);
      }
      if (dueDateChanges.isUpdated) {
        const sentence = this.composeStringForDueDateChanges('added', dueDateChanges.isUpdated.due_date);
        preparedCommonMessage.push(sentence);
      }
      if (dueDateChanges.isDeleted) {
        const sentence = this.composeStringForDueDateChanges('deleted');
        preparedCommonMessage.push(sentence);
      }
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
    if (addedLabels && deletedLabels) {
      if (addedLabels.length === 1) {
        endOfText += 'добавился лейбл ';
        addedLabels.forEach((label) => (endOfText += `${label} `));
      } else {
        endOfText += 'добавились лейблы ';
        addedLabels.forEach((label) => (endOfText += `${label}, `));
      }
      if (deletedLabels.length === 1) {
        endOfText += 'и удалился лейбл ';
        deletedLabels.forEach((label) => (endOfText += `${label}.`));
      } else {
        endOfText += 'и удалились лейблы ';
        deletedLabels.forEach((label) => (endOfText += `${label}, `));
        endOfText = endOfText.replace(/(,\s|\s)$/, '.');
      }
      return endOfText;
    }
    if (addedLabels && !deletedLabels) {
      if (addedLabels.length === 1) {
        endOfText += 'добавился лейбл ';
        addedLabels.forEach((label) => (endOfText += `${label} `));
      } else {
        endOfText += 'добавились лейблы ';
        addedLabels.forEach((label) => (endOfText += `${label}, `));
      }
      return endOfText;
    }
    if (deletedLabels && deletedLabels.length === 1) {
      endOfText += 'удалился лейбл ';
      deletedLabels.forEach((label) => (endOfText += `${label}.`));
    } else if (deletedLabels) {
      endOfText += 'удалились лейблы ';
      deletedLabels.forEach((label) => (endOfText += `${label}, `));
      endOfText = endOfText.replace(/(,\s|\s)$/, '.');
    }
    return endOfText;
  }

  private composeStringForAssigneesChanges(addedAssignees?: UserInfo[], deletedAssignees?: UserInfo[]) {
    let endOfText = '';
    if (addedAssignees && deletedAssignees) {
      if (addedAssignees.length === 1) {
        endOfText += 'назначен исполнитель ';
        addedAssignees.forEach((user) => (endOfText += `${user.name}, `));
      } else {
        endOfText += 'назначены исполнители ';
        addedAssignees.forEach((user) => (endOfText += `${user.name}, `));
      }
      if (deletedAssignees.length === 1) {
        endOfText += 'и перестал быть исполнителем ';
        deletedAssignees.forEach((user) => (endOfText += `${user.name}.`));
      } else {
        endOfText += 'и перестали быть исполнителями ';
        deletedAssignees.forEach((user) => (endOfText += `${user.name}, `));
        endOfText = endOfText.replace(/(,\s|\s)$/, '.');
      }
      return endOfText;
    }
    if (addedAssignees && !deletedAssignees) {
      if (addedAssignees.length === 1) {
        endOfText += 'назначен исполнитель ';
        addedAssignees.forEach((user) => (endOfText += `${user.name}, `));
      } else {
        endOfText += 'назначены исполнители ';
        addedAssignees.forEach((user) => (endOfText += `${user.name}, `));
      }
      return endOfText;
    }
    if (deletedAssignees && deletedAssignees.length === 1) {
      endOfText += 'перестал быть исполнителем ';
      deletedAssignees.forEach((user) => (endOfText += `${user.name}.`));
    } else if (deletedAssignees) {
      endOfText += 'перестали быть исполнителями ';
      deletedAssignees.forEach((user) => (endOfText += `${user.name}, `));
      endOfText = endOfText.replace(/(,\s|\s)$/, '.');
    }
    return endOfText;
  }
}
