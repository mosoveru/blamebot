import { Injectable } from '@nestjs/common';
import { EventChanges, NotificationComposer, NotificationMessage } from '../../types';

@Injectable()
export class NotificationComposerService implements NotificationComposer {
  composeNotification(changes: EventChanges): NotificationMessage {
    return {
      message: 'Notification Composer',
    };
  }
}
