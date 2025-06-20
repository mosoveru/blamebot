import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';
import { ObjectTypes } from '../../../constants/enums';

type ChangesForRequest = EventChanges<RequestMessageComposer['meantFor']>;
type UserInfo = {
  id: string;
  name: string;
};

export class RequestMessageComposer implements MessageComposer {
  readonly meantFor = ObjectTypes.REQUEST;

  composeMessage(changes: ChangesForRequest[]): NotificationMessage[] {
    const individualChanges = changes.filter((change) => change.instanceUserId);
    const commonChanges = changes.find((change) => change.isCommon)!;
    const notificationMessages: NotificationMessage[] = [];
    for (const eventChanges of individualChanges) {
      if (eventChanges.changes.forAssignee) {
        notificationMessages.push({
          instanceUserId: eventChanges.instanceUserId,
          message: this.composeMessageForRequestAssignee(eventChanges),
        });
      }
      if (eventChanges.changes.forReviewer) {
        notificationMessages.push({
          instanceUserId: eventChanges.instanceUserId,
          message: this.composeMessageForRequestReviewer(eventChanges),
        });
      }
      if (eventChanges.changes.forAuthor) {
        notificationMessages.push({
          instanceUserId: eventChanges.instanceUserId,
          message: this.composeMessageForRequestAuthor(eventChanges),
        });
      }
    }
    notificationMessages.push({
      message: this.composeCommonMessageForRequest(commonChanges),
    });
    return notificationMessages;
  }

  private composeBaseIssuePhrase(eventChanges: ChangesForRequest): string {
    return `<a href="${eventChanges.objectUrl}">Merge Request #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
  }

  private composeMessageForRequestAssignee(eventChanges: ChangesForRequest): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В Вашем ${basePhrase} `);
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.withAssignment) {
      return `Вы стали ответственным за ${basePhrase}`;
    }
    if (eventChanges.changes.isUnassigned) {
      return `Вы перестали быть ответственным за ${basePhrase}`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваш ${basePhrase} была закрыт`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваш ${basePhrase} <b>снова открыт</b>`;
    }
    if (eventChanges.changes.isMerged) {
      return `Ваш ${basePhrase} слит в ветку ${eventChanges.changes.isMerged.target_branch}`;
    }
    if (eventChanges.changes.isApproved) {
      return `Ваш ${basePhrase} был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `У вашего ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeMessageForRequestReviewer(eventChanges: ChangesForRequest): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В Вашем ${basePhrase} `);
    if (eventChanges.changes.isNewReviewer || eventChanges.changes.isNewObject?.withReviewer) {
      return `На вас назначили ревью в ${basePhrase}`;
    }
    if (eventChanges.changes.isUnassignedReviewer) {
      return `Вы перестали быть ревьюером в ${basePhrase}`;
    }
    if (eventChanges.changes.isClosed) {
      return `${basePhrase}, в котором вы являетесь ревьюером, был закрыт`;
    }
    if (eventChanges.changes.isReopened) {
      return `${basePhrase}, в котором вы являетесь ревьюером, был снова открыт`;
    }
    if (eventChanges.changes.isMerged) {
      return `${basePhrase}, в котором вы являетесь ревьюером, был слит в ветку ${eventChanges.changes.isMerged.target_branch}`;
    }
    if (eventChanges.changes.isApproved) {
      return `В ${basePhrase}, в котором вы являетесь ревьюером, был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `В ${basePhrase}, в котором вы являетесь ревьюером, был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeMessageForRequestAuthor(eventChanges: ChangesForRequest): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В Вашем ${basePhrase} `);
    if (eventChanges.changes.isNewAssignment || eventChanges.changes.isNewObject?.withAssignment) {
      return `В Вашем ${basePhrase} был изменён исполнитель`;
    }
    if (eventChanges.changes.isNewReviewer || eventChanges.changes.isNewObject?.withReviewer) {
      return `В вашем ${basePhrase} был изменён ревьюер`;
    }
    if (eventChanges.changes.isClosed) {
      return `Ваш ${basePhrase} был закрыт`;
    }
    if (eventChanges.changes.isReopened) {
      return `Ваш ${basePhrase} <b>снова открыт</b>`;
    }
    if (eventChanges.changes.isMerged) {
      return `Ваш ${basePhrase} слит в ветку ${eventChanges.changes.isMerged.target_branch}`;
    }
    if (eventChanges.changes.isApproved) {
      return `Ваш ${basePhrase} был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `У вашего ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeCommonMessageForRequest(eventChanges: ChangesForRequest): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В связанном с Вами ${basePhrase} `);
    if (eventChanges.changes.isClosed) {
      return `Связанный с Вами ${basePhrase} был закрыт`;
    }
    if (eventChanges.changes.isReopened) {
      return `Связанный с Вами ${basePhrase} был снова открыт`;
    }
    if (eventChanges.changes.isMerged) {
      return `Связанный с Вами ${basePhrase} был снова открыт был слит в ветку ${eventChanges.changes.isMerged.target_branch}`;
    }
    if (eventChanges.changes.isApproved) {
      return `Связанный с Вами ${basePhrase} был апрвнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `В связанном с вами ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private listMinorChanges(eventChanges: ChangesForRequest, preparedCommonMessage: string[]) {
    if (eventChanges.changes.isDescriptionChanged) {
      preparedCommonMessage.push('было изменено описание, ');
    }
    if (eventChanges.changes.isTitleChanged) {
      preparedCommonMessage.push('был изменён заголовок, ');
    }
    if (eventChanges.changes.isLabelsChanged) {
      const { added, deleted } = eventChanges.changes.isLabelsChanged;
      const sentence = this.composeStringForLabelChanges(added, deleted);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isAssigneesChanges) {
      const { added, deleted } = eventChanges.changes.isAssigneesChanges;
      const sentence = this.composeStringForUserChanges('assignees', added, deleted);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.isReviewerChanges) {
      const { added, deleted } = eventChanges.changes.isReviewerChanges;
      const sentence = this.composeStringForUserChanges('reviewers', added, deleted);
      preparedCommonMessage.push(sentence);
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

  private composeStringForUserChanges(
    meantFor: 'reviewers' | 'assignees',
    addedAssignees?: UserInfo[],
    deletedAssignees?: UserInfo[],
  ) {
    const addedSingle = meantFor === 'assignees' ? 'был назначен исполнитель ' : 'был назначен ревьюер ';
    const deletedSingle = meantFor === 'assignees' ? 'перестал быть исполнителем ' : 'перестал быть ревьюером ';
    const addedPlural = meantFor === 'assignees' ? 'были назначены исполнители ' : 'были назначены ревьюеры ';
    const deletedPlural = meantFor === 'assignees' ? 'перестали быть исполнителями ' : 'перестали быть ревьюерами ';
    const sentenceParts: string[] = [];
    const hasAdded = addedAssignees && addedAssignees.length > 0;
    const hasDeleted = deletedAssignees && deletedAssignees.length > 0;

    if (hasAdded) {
      sentenceParts.push(
        addedAssignees!.length === 1 ? addedSingle : addedPlural,
        this.joinUserNames(addedAssignees!),
        hasDeleted ? '' : '.',
      );
    }

    if (hasDeleted) {
      if (hasAdded) {
        sentenceParts.push('и ');
      }
      sentenceParts.push(
        deletedAssignees!.length === 1 ? deletedSingle : deletedPlural,
        this.joinUserNames(deletedAssignees!),
        '.',
      );
    }

    return sentenceParts.join('');
  }
}
