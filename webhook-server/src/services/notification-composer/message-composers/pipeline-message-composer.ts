import { EventChanges, MessageComposer, NotificationMessage } from '../../../types';
import { ObjectTypes } from '../../../constants/enums';

type ChangesForPipeline = EventChanges<PipelineMessageComposer['meantFor']>;

export class PipelineMessageComposer implements MessageComposer {
  readonly meantFor = ObjectTypes.PIPELINE;

  composeMessage(changes: ChangesForPipeline[]): NotificationMessage[] {
    const commonChanges = changes.find((change) => change.isCommon)!;
    const notificationMessages: NotificationMessage[] = [];
    notificationMessages.push({
      message: this.composeCommonMessageForPipelineEvent(commonChanges),
    });
    return notificationMessages;
  }

  private composeBasePipelinePhrase(eventChanges: ChangesForPipeline): string {
    return `<a href="${eventChanges.objectUrl}">Pipeline #${eventChanges.objectId}</a> в проекте <a href="${eventChanges.projectUrl}">${eventChanges.projectName}</a>`;
  }

  private composeCommonMessageForPipelineEvent(changes: ChangesForPipeline): string {
    const base = this.composeBasePipelinePhrase(changes);
    if (changes.changes.isPipelinePending) {
      return `${base} начался ▶️`;
    }
    if (changes.changes.isPipelineFailed) {
      return `❌ ${base} <b>провалился</b> ❌`;
    }
    return `${base} успешно прошёл ✅`;
  }
}
