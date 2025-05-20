import { Injectable, Logger } from '@nestjs/common';
import { EventChanges, MessageComposer, NotificationMessage } from '../../types';
import { ObjectTypes } from '../../constants/enums';

@Injectable()
export class NotificationComposerService {
  constructor(
    private readonly logger: Logger,
    private readonly composers: Map<ObjectTypes, MessageComposer>,
  ) {}

  composeNotifications(changes: EventChanges<any>[]): NotificationMessage[] | null {
    const commonChanges = changes.find((change) => change.isCommon);
    if (!commonChanges) {
      this.logger.error(
        'There is no common changes described for Notification Composer. Check the parse event changes method for proper logic',
      );
      return null;
    }
    if (!commonChanges.changes.haveChanges) {
      this.logger.warn(
        "There is no changes in common changes object. Maybe we've encountered unknown changes in event payload?",
      );
      return null;
    }
    const composer = this.composers.get(commonChanges.objectType);
    if (!composer) {
      return null;
    }
    return composer.composeMessage(changes);
  }
}
