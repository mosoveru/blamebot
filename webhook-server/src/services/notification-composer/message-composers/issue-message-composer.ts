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

  private composeBaseIssuePhrase(eventChanges: ChangesForIssue): string {
    return `<a href="${eventChanges.objectUrl}">Issue #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
  }

  private composeMessageForIssueAssignee(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В Вашем ${basePhrase} `);
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      return `На Вас назначали новое ${basePhrase}`;
    }
    if (eventChanges.changes.isUnassigned) {
      return `Вы перестали быть исполнителем в ${basePhrase}`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша ${basePhrase} была закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша ${basePhrase} <b>снова открыта</b>`;
    }
    if (eventChanges.changes.newComment) {
      return `В вашем ${basePhrase} оставили комментарий.`;
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
      return `На Вас назначали новое ${basePhrase} с дедлайном до <b>${date}</b>`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeMessageForIssueAuthor(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В Вашем ${basePhrase} `);
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      return `В Вашем ${basePhrase} был изменён исполнитель`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваша ${basePhrase} была закрыта`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваша ${basePhrase} <b>снова открыта</b>`;
    }
    if (eventChanges.changes.newComment) {
      return `В вашем ${basePhrase} оставили комментарий.`;
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
      return `В Вашем ${basePhrase} был изменён исполнитель и был назначен дедлайн до <b>${date}</b>`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeCommonMessageForIssue(eventChanges: ChangesForIssue): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В связанном с Вами ${basePhrase} `);
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.isNewAssignment) {
      preparedCommonMessage.push(`был изменён исполнитель, `);
    }
    if (eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline) {
      const date = eventChanges.changes.isNewObject?.isNewAssignmentWithDeadline.deadline;
      preparedCommonMessage.push(`сменился исполнитель, добавился дедлайн до <b>${date}</b>, `);
    }
    if (eventChanges.changes.isClosed) {
      return `Связанное с Вами ${basePhrase} было закрыто`;
    }
    if (eventChanges.changes.isReopened) {
      return `Связанное с Вами ${basePhrase} <b>снова открылось</b>`;
    }
    if (eventChanges.changes.newComment) {
      return `В связанном с вами ${basePhrase} оставили комментарий.`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private listMinorChanges(eventChanges: ChangesForIssue, preparedCommonMessage: string[]) {
    if (eventChanges.changes.isDescriptionChanged) {
      preparedCommonMessage.push('было изменено описание, ');
    }
    if (eventChanges.changes.isTitleChanged) {
      preparedCommonMessage.push('был изменён заголовок, ');
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
        const sentence = this.composeStringForDueDateChanges('updated', dueDateChanges.isUpdated.due_date);
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
      return `дедлайн был обновлён до <b>${date}</b>, `;
    } else if (type === 'added') {
      return `был добавлен дедлайн до <b>${date}</b>, `;
    } else {
      return `дедлайн был удалён, `;
    }
  }

  private composeStringForLabelChanges(addedLabels?: string[], deletedLabels?: string[]): string {
    const phrases: string[] = [];

    if (addedLabels?.length) {
      const single = addedLabels.length === 1;
      phrases.push(
        `${single ? 'был добавлен' : 'были добавлены'} ${single ? 'лейбл' : 'лейблы'} ${addedLabels.join(', ')}`,
      );
    }

    if (deletedLabels?.length) {
      const single = deletedLabels.length === 1;
      phrases.push(
        `${single ? 'был удалён' : 'были удалены'} ${single ? 'лейбл' : 'лейблы'} ${deletedLabels.join(', ')}`,
      );
    }

    if (!phrases.length) {
      return '';
    }

    return `${phrases.join(' и ')}.`;
  }

  private joinUserNames(users: UserInfo[]) {
    return users.map((u) => u.name).join(', ');
  }

  private composeStringForAssigneesChanges(addedAssignees?: UserInfo[], deletedAssignees?: UserInfo[]) {
    const sentenceParts: string[] = [];
    const hasAdded = addedAssignees && addedAssignees.length > 0;
    const hasDeleted = deletedAssignees && deletedAssignees.length > 0;

    if (hasAdded) {
      sentenceParts.push(
        addedAssignees!.length === 1 ? 'был назначен исполнитель ' : 'были назначены исполнители ',
        this.joinUserNames(addedAssignees!),
        hasDeleted ? '' : '.',
      );
    }

    if (hasDeleted) {
      if (hasAdded) {
        sentenceParts.push('и ');
      }
      sentenceParts.push(
        deletedAssignees!.length === 1 ? 'перестал быть исполнителем ' : 'перестали быть исполнителями ',
        this.joinUserNames(deletedAssignees!),
        '.',
      );
    }

    return sentenceParts.join('');
  }
}
