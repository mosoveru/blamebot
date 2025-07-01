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
    if (eventChanges.changes.newComment) {
      return `В вашем ${basePhrase} оставили комментарий.`;
    } else if (eventChanges.changes.newCommentOnFiles) {
      return `На изменениях в ${basePhrase} был оставлен комментарий.`;
    }
    if (eventChanges.changes.isApproved) {
      return `Ваш ${basePhrase} был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `У вашего ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    if (eventChanges.changes.isEmojiChanged) {
      return `В вашем ${basePhrase} ${this.composeStringForEmojiChanges(eventChanges)}`;
    }
    if (eventChanges.changes.pipelineChanges) {
      return `В вашем ${basePhrase} ${this.composeCommonMessageForPipelineEvent(eventChanges)}`;
    }
    this.listMinorChanges(eventChanges, preparedCommonMessage);
    return preparedCommonMessage.join('').replace(/,\s$/, '.');
  }

  private composeMessageForRequestReviewer(eventChanges: ChangesForRequest): string {
    const preparedCommonMessage: string[] = [];
    const basePhrase = this.composeBaseIssuePhrase(eventChanges);
    preparedCommonMessage.push(`В ${basePhrase}, в котором вы являетесь ревьюером, `);
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
    if (eventChanges.changes.newComment) {
      return `В вашем ${basePhrase}, которое вы ревьюите, оставили комментарий.`;
    } else if (eventChanges.changes.newCommentOnFiles) {
      return `На изменениях в ${basePhrase} был оставлен комментарий.`;
    }
    if (eventChanges.changes.isApproved) {
      return `${basePhrase}, в котором вы являетесь ревьюером, был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `В ${basePhrase}, в котором вы являетесь ревьюером, был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    if (eventChanges.changes.isEmojiChanged) {
      return `В вашем ${basePhrase}, которое вы ревьюите, ${this.composeStringForEmojiChanges(eventChanges)}`;
    }
    if (eventChanges.changes.pipelineChanges) {
      return `В вашем ${basePhrase}, которое вы ревьюите, ${this.composeCommonMessageForPipelineEvent(eventChanges)}`;
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
    if (eventChanges.changes.newComment) {
      return `В вашем ${basePhrase}, оставили комментарий.`;
    } else if (eventChanges.changes.newCommentOnFiles) {
      return `На изменениях в ${basePhrase} был оставлен комментарий.`;
    }
    if (eventChanges.changes.isApproved) {
      return `Ваш ${basePhrase} был апрувнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `У вашего ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    if (eventChanges.changes.isEmojiChanged) {
      return `В вашем ${basePhrase} ${this.composeStringForEmojiChanges(eventChanges)}`;
    }
    if (eventChanges.changes.pipelineChanges) {
      return `В вашем ${basePhrase} ${this.composeCommonMessageForPipelineEvent(eventChanges)}`;
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
    if (eventChanges.changes.newComment) {
      return `В связанном с вами ${basePhrase} был оставлен комментарий.`;
    } else if (eventChanges.changes.newCommentOnFiles) {
      return `В связанном с вами ${basePhrase} на изменениях был оставлен комментарий.`;
    }
    if (eventChanges.changes.isApproved) {
      return `Связанный с Вами ${basePhrase} был апрвнут пользователем ${eventChanges.changes.isApproved.by}`;
    }
    if (eventChanges.changes.isUnapproved) {
      return `В связанном с вами ${basePhrase} был убран апрув пользователем ${eventChanges.changes.isUnapproved.by}`;
    }
    if (eventChanges.changes.isEmojiChanged) {
      return `В связанном с вами ${basePhrase} ${this.composeStringForEmojiChanges(eventChanges)}`;
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
      const justChanged = eventChanges.changes.isLabelsChanged.justChanged;
      const { added, deleted } = eventChanges.changes.isLabelsChanged;
      const sentence = this.composeStringForLabelChanges(added, deleted);
      preparedCommonMessage.push(justChanged ? 'были изменены лейблы' : sentence);
    }
    if (eventChanges.changes.isAssigneesChanges) {
      const justChanged = eventChanges.changes.isAssigneesChanges.justChanged;
      const { added, deleted } = eventChanges.changes.isAssigneesChanges;
      const sentence = this.composeStringForUserChanges('assignees', added, deleted);
      preparedCommonMessage.push(justChanged ? 'были изменены исполнители' : sentence);
    }
    if (eventChanges.changes.isReviewerChanges) {
      const { added, deleted } = eventChanges.changes.isReviewerChanges;
      const sentence = this.composeStringForUserChanges('reviewers', added, deleted);
      preparedCommonMessage.push(sentence);
    }
    if (eventChanges.changes.pipelineChanges) {
      const sentence = this.composeCommonMessageForPipelineEvent(eventChanges);
      preparedCommonMessage.push(sentence);
    }
  }

  private composeStringForEmojiChanges(emojiChanges: ChangesForRequest): string {
    const isAdded = emojiChanges?.changes.isEmojiChanged?.isAdded;
    const isDeleted = emojiChanges?.changes.isEmojiChanged?.isDeleted;

    const emojiActionsMap: Record<string, string> = {
      isEmojiThumbUp: 'лайк',
      isEmojiThumbDown: 'дизлайк',
      isEmojiClown: 'клоуна 🤡',
    };

    const actionPrefix = isAdded ? 'поставили' : 'убрали';
    const emojiChange = isAdded ?? isDeleted;

    if (emojiChange) {
      for (const [key, label] of Object.entries(emojiActionsMap)) {
        if (emojiChange[key as keyof typeof emojiChange]) {
          return `${actionPrefix} ${label}.`;
        }
      }
      return `${actionPrefix} смайлик.`;
    }

    return '';
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
  ): string {
    const roleMap = {
      assignees: {
        singleAdd: 'был назначен исполнитель ',
        pluralAdd: 'были назначены исполнители ',
        singleDel: 'перестал быть исполнителем ',
        pluralDel: 'перестали быть исполнителями ',
      },
      reviewers: {
        singleAdd: 'был назначен ревьюер ',
        pluralAdd: 'были назначены ревьюеры ',
        singleDel: 'перестал быть ревьюером ',
        pluralDel: 'перестали быть ревьюерами ',
      },
    };

    const role = roleMap[meantFor];
    const parts: string[] = [];

    const formatChange = (users: UserInfo[], singleText: string, pluralText: string) => {
      const prefix = users.length === 1 ? singleText : pluralText;
      return `${prefix}${this.joinUserNames(users)}`;
    };

    const hasAdded = addedAssignees?.length;
    const hasDeleted = deletedAssignees?.length;

    if (hasAdded) {
      parts.push(formatChange(addedAssignees!, role.singleAdd, role.pluralAdd));
    }

    if (hasDeleted) {
      if (hasAdded) parts.push(' и ');
      parts.push(formatChange(deletedAssignees!, role.singleDel, role.pluralDel));
    }

    return parts.length > 0 ? parts.join('') + '.' : '';
  }

  private composeCommonMessageForPipelineEvent(changes: ChangesForRequest): string {
    if (changes.changes.pipelineChanges?.isPipelinePending) {
      return ` начался Pipeline ▶️`;
    }
    if (changes.changes.pipelineChanges?.isPipelineFailed) {
      return `<b>провалился Pipeline</b> ❌`;
    }
    return `успешно прошёл Pipeline ✅`;
  }
}
