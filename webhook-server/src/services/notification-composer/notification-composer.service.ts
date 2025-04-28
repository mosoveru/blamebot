import { Injectable } from '@nestjs/common';
import { EventChanges, NotificationMessage } from '../../types';

@Injectable()
export class NotificationComposerService {
  composeNotification(changes: EventChanges): NotificationMessage[] {
    return [
      {
        message: 'Notification Composer',
      },
    ];
  }
}
